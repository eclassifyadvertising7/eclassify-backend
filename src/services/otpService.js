import crypto from 'crypto';
import otpRepository from '#repositories/otpRepository.js';
import authRepository from '#repositories/authRepository.js';
import smsService from '#services/smsService.js';
import emailService from '#services/emailService.js';
import config from '#config/env.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * OtpService - Business logic for OTP operations
 * Singleton pattern for consistent instance usage
 */
class OtpService {

  _generateOtp() {
    return smsService.generateOtp();
  }



  async sendOtp(data, requestInfo = {}) {
    const { mobile, email, countryCode = '+91', type, fullName } = data;

    // Validate type
    if (!type || !['signup', 'login', 'verification'].includes(type)) {
      throw new Error('Invalid OTP type. Must be signup, login, or verification');
    }

    // Get channel from environment configuration
    const channel = config.otp.channel;

    // Validate required fields based on environment channel
    if (channel === 'email') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email address is required');
      }
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
      }
    } else {
      // SMS channel
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email address is required');
      }
    }

    // Check if user exists based on mobile (primary identifier)
    const existingUser = await authRepository.findByMobile(mobile);
    const identifier = channel === 'email' ? email : mobile;

    // Validation based on type
    if (type === 'signup' && existingUser) {
      const contactType = channel === 'email' ? 'Email address' : 'Mobile number';
      throw new Error(`${contactType} already registered. Please use login instead`);
    }

    if (type === 'login' && !existingUser) {
      const contactType = channel === 'email' ? 'Email address' : 'Mobile number';
      throw new Error(`${contactType} not registered. Please sign up first`);
    }

    // Rate limiting: Check OTP requests for this identifier in last hour (max 5)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtpCount = await otpRepository.countRecentOtpsByIdentifier(identifier, oneHourAgo);
    
    if (recentOtpCount >= 5) {
      const contactType = channel === 'email' ? 'email address' : 'mobile number';
      throw new Error(`Too many OTP requests for this ${contactType}. Please try again after 1 hour`);
    }

    // Invalidate previous OTPs
    await otpRepository.invalidatePreviousOtps(identifier, type);

    // Generate OTP
    const otp = this._generateOtp();

    // Create OTP record (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const otpData = {
      otp,
      type,
      channel,
      expiresAt,
      ipAddress: requestInfo.ipAddress || null,
      userAgent: requestInfo.userAgent || null,
      sessionId: requestInfo.sessionId || null
    };

    // Add identifier based on channel
    if (channel === 'email') {
      otpData.email = email;
      otpData.mobile = null; // Ensure mobile is null for email OTP
    } else {
      otpData.mobile = mobile;
      otpData.countryCode = countryCode;
      otpData.email = null; // Ensure email is null for mobile OTP
    }
    
    await otpRepository.create(otpData);

    // Send OTP via SMS or Email based on environment configuration
    if (channel === 'email') {
      // Send Email OTP
      try {
        const emailSent = await emailService.sendOtp(email, otp, type, fullName);
        if (!emailSent) {
          throw new Error('Failed to send email');
        }
        console.log(`[EMAIL] OTP sent to ${email}`);
      } catch (emailError) {
        console.error('Email send failed:', emailError.message);
        // In development, log OTP to console as fallback
        if (NODE_ENV === 'development') {
          console.log(`[FALLBACK] Email OTP for ${email}: ${otp}`);
        }
        throw new Error('Failed to send OTP via email. Please try again later.');
      }
    } else {
      // Send SMS OTP
      try {
        await smsService.sendOtp(mobile, otp);
        console.log(`[SMS] OTP sent to ${mobile}`);
      } catch (smsError) {
        console.error('SMS send failed:', smsError.message);
        // In development, log OTP to console as fallback
        if (NODE_ENV === 'development') {
          console.log(`[FALLBACK] SMS OTP for ${mobile}: ${otp}`);
        }
        throw new Error(ERROR_MESSAGES.OTP_SEND_FAILED);
      }
    }

    const responseData = {
      type,
      channel,
      mobile,
      countryCode,
      email,
      expiresIn: 600 // seconds
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT,
      data: responseData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verify OTP only (no user creation or login)
   * @param {Object} data - Request data
   * @param {string} data.mobile - Mobile number (for mobile OTP)
   * @param {string} data.email - Email address (for email OTP)
   * @param {string} data.otp - OTP code
   * @param {string} data.type - Type (signup/login/verification)
   * @returns {Promise<Object>} Verification result
   */
  async verifyOtp(data) {
    const { mobile, email, otp, type } = data;

    // Validate required fields
    if (!otp || !type) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    // Validate that both mobile and email are provided
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Valid email address is required');
    }

    // Get channel from environment configuration
    const channel = config.otp.channel;
    const identifier = channel === 'email' ? email : mobile;

    // Find active OTP
    const otpRecord = await otpRepository.findActiveOtp(identifier, type);

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

    const responseData = {
      type,
      verified: true,
      mobile,
      email,
      channel: config.otp.channel
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_VERIFIED,
      data: responseData
    };
  }
}

// Export singleton instance
export default new OtpService();
