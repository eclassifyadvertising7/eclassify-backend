import crypto from 'crypto';
import otpRepository from '#repositories/otpRepository.js';
import authRepository from '#repositories/authRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

/**
 * OtpService - Business logic for OTP operations
 * Singleton pattern for consistent instance usage
 */
class OtpService {
  /**
   * Generate hardcoded OTP for development
   * @returns {string} OTP code
   */
  _generateOtp() {
    // Hardcoded OTP for development (no DLT registration)
    return '1234';
  }



  /**
   * Send OTP to mobile number
   * @param {Object} data - Request data
   * @param {string} data.mobile - Mobile number
   * @param {string} data.countryCode - Country code (optional)
   * @param {string} data.type - Type (signup/login)
   * @param {string} data.channel - Channel (sms/email/whatsapp) (optional)
   * @param {Object} requestInfo - Request information (IP, user agent)
   * @returns {Promise<Object>} Service response
   */
  async sendOtp(data, requestInfo = {}) {
    const { mobile, countryCode = '+91', type, channel = 'sms' } = data;

    // Validate required fields
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (!type || !['signup', 'login', 'verification'].includes(type)) {
      throw new Error('Invalid OTP type. Must be signup, login, or verification');
    }

    // Check if user exists
    const existingUser = await authRepository.findByMobile(mobile);

    // Validation based on type
    if (type === 'signup' && existingUser) {
      throw new Error('Mobile number already registered. Please use login instead');
    }

    if (type === 'login' && !existingUser) {
      throw new Error('Mobile number not registered. Please sign up first');
    }

    // Rate limiting: Check OTP requests for this mobile in last hour (max 5)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtpCount = await otpRepository.countRecentOtpsByMobile(mobile, oneHourAgo);
    
    if (recentOtpCount >= 5) {
      throw new Error('Too many OTP requests for this mobile number. Please try again after 1 hour');
    }

    // Invalidate previous OTPs
    await otpRepository.invalidatePreviousOtps(mobile, type);

    // Generate OTP
    const otp = this._generateOtp();

    // Create OTP record (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await otpRepository.create({
      mobile,
      countryCode,
      otp,
      type,
      channel,
      expiresAt,
      ipAddress: requestInfo.ipAddress || null,
      userAgent: requestInfo.userAgent || null,
      sessionId: requestInfo.sessionId || null
    });

    // In production, send SMS here
    // await smsService.sendOtp(mobile, otp);

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT,
      data: {
        mobile,
        countryCode,
        type,
        channel,
        expiresIn: 600 // seconds
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verify OTP only (no user creation or login)
   * @param {Object} data - Request data
   * @param {string} data.mobile - Mobile number
   * @param {string} data.otp - OTP code
   * @param {string} data.type - Type (signup/login/verification)
   * @returns {Promise<Object>} Verification result
   */
  async verifyOtp(data) {
    const { mobile, otp, type } = data;

    // Validate required fields
    if (!mobile || !otp || !type) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    // Find active OTP
    const otpRecord = await otpRepository.findActiveOtp(mobile, type);

    if (!otpRecord) {
      throw new Error(ERROR_MESSAGES.OTP_NOT_FOUND);
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      throw new Error(ERROR_MESSAGES.OTP_EXPIRED);
    }

    // Check max attempts (5 attempts)
    if (otpRecord.attempts >= 5) {
      throw new Error(ERROR_MESSAGES.OTP_MAX_ATTEMPTS);
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await otpRepository.incrementAttempts(otpRecord.id);
      throw new Error(ERROR_MESSAGES.OTP_INVALID);
    }

    // Mark OTP as verified
    await otpRepository.markAsVerified(otpRecord.id);

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_VERIFIED,
      data: {
        mobile,
        type,
        verified: true
      }
    };
  }
}

// Export singleton instance
export default new OtpService();
