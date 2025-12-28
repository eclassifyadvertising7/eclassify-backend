import otpRepository from '#repositories/otpRepository.js';
import authRepository from '#repositories/authRepository.js';
import smsService from '#services/smsService.js';
import emailService from '#services/emailService.js';
import config from '#config/env.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

class OtpService {
  _generateOtp() {
    return smsService.generateOtp();
  }

  async sendOtp(data, requestInfo = {}) {
    const { mobile, email, countryCode = '+91', type, fullName } = data;

    if (!type || !['signup', 'login', 'verification'].includes(type)) {
      throw new Error('Invalid OTP type. Must be signup, login, or verification');
    }

    const channel = config.otp.channel;

    if (channel === 'email') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email address is required');
      }
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
      }
    } else {
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email address is required');
      }
    }

    const existingUser = await authRepository.findByMobile(mobile);
    const identifier = channel === 'email' ? email : mobile;

    if (type === 'signup' && existingUser) {
      const contactType = channel === 'email' ? 'Email address' : 'Mobile number';
      throw new Error(`${contactType} already registered. Please use login instead`);
    }

    if (type === 'login' && !existingUser) {
      const contactType = channel === 'email' ? 'Email address' : 'Mobile number';
      throw new Error(`${contactType} not registered. Please sign up first`);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtpCount = await otpRepository.countRecentOtpsByIdentifier(identifier, oneHourAgo);
    
    if (recentOtpCount >= 5) {
      const contactType = channel === 'email' ? 'email address' : 'mobile number';
      throw new Error(`Too many OTP requests for this ${contactType}. Please try again after 1 hour`);
    }

    await otpRepository.invalidatePreviousOtps(identifier, type);

    const otp = this._generateOtp();

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

    if (channel === 'email') {
      otpData.email = email;
      otpData.mobile = null;
    } else {
      otpData.mobile = mobile;
      otpData.countryCode = countryCode;
      otpData.email = null;
    }
    
    await otpRepository.create(otpData);

    if (channel === 'email') {
      try {
        await emailService.sendOtp(email, otp, type, fullName);
      } catch (emailError) {
        console.error('OTP email sending failed:', {
          email,
          error: emailError.message,
          code: emailError.code,
          stack: emailError.stack
        });
        
        if (NODE_ENV === 'development') {
          console.log(`[FALLBACK] Email OTP for ${email}: ${otp}`);
        }
        
        // Provide more specific error message
        const errorMessage = emailError.message.includes('Email service not available')
          ? 'Email service is not configured. Please contact support.'
          : 'Failed to send OTP via email. Please try again later.';
        
        throw new Error(errorMessage);
      }
    } else {
      try {
        await smsService.sendOtp(mobile, otp);
      } catch (smsError) {
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
      expiresIn: 600
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT,
      data: responseData,
      timestamp: new Date().toISOString()
    };
  }

  async verifyOtp(data) {
    const { mobile, email, otp, type } = data;

    if (!otp || !type) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Valid email address is required');
    }

    const channel = config.otp.channel;
    const identifier = channel === 'email' ? email : mobile;

    const otpRecord = await otpRepository.findActiveOtp(identifier, type);

    if (!otpRecord) {
      throw new Error(ERROR_MESSAGES.OTP_NOT_FOUND);
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new Error(ERROR_MESSAGES.OTP_EXPIRED);
    }

    if (otpRecord.attempts >= 5) {
      throw new Error(ERROR_MESSAGES.OTP_MAX_ATTEMPTS);
    }

    if (otpRecord.otp !== otp) {
      await otpRepository.incrementAttempts(otpRecord.id);
      throw new Error(ERROR_MESSAGES.OTP_INVALID);
    }

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

export default new OtpService();
