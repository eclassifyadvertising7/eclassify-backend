import otpService from '#services/otpService.js';
import authService from '#services/authService.js';

/**
 * OtpController - Handle OTP-based authentication HTTP requests
 * All methods are static as per project architecture
 */
class OtpController {
  /**
   * Send OTP to mobile number
   * @route POST /api/auth/otp/send
   */
  static async sendOtp(req, res) {
    try {
      // Optional: Capture request info if frontend sends it
      const requestInfo = {
        ipAddress: req.body.ip_address || req.ip || req.connection.remoteAddress,
        userAgent: req.body.user_agent || req.headers['user-agent'],
        sessionId: req.body.session_id || null
      };

      const result = await otpService.sendOtp(req.body, requestInfo);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Verify OTP - only verification, no user creation
   * @route POST /api/auth/otp/verify
   */
  static async verifyOtp(req, res) {
    try {
      const { type, mobile, email, otp } = req.body;

      // Verify OTP
      await otpService.verifyOtp({ mobile, email, otp, type });

      const identifier = mobile || email;
      const contactType = mobile ? 'Mobile number' : 'Email address';
      
      return res.status(200).json({
        success: true,
        message: `${contactType} verified successfully`,
        data: {
          ...(mobile && { mobile }),
          ...(email && { email }),
          type,
          verified: true
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Complete signup after OTP verification
   * @route POST /api/auth/otp/signup
   */
  static async completeSignup(req, res) {
    try {
      const { mobile, email, fullName, countryCode } = req.body;

      // Device info for session tracking
      const deviceInfo = {
        deviceName: req.body.device_name,
        userAgent: req.headers['user-agent'],
        ipAddressV4: req.ip || req.connection.remoteAddress
      };

      // Call auth service to create user (it will verify OTP status)
      const result = await authService.signupWithOtp(
        { mobile, email, fullName, countryCode },
        deviceInfo
      );

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Complete login after OTP verification
   * @route POST /api/auth/otp/login
   */
  static async completeLogin(req, res) {
    try {
      const { mobile, email } = req.body;

      // Device info for session tracking
      const deviceInfo = {
        deviceName: req.body.device_name,
        userAgent: req.headers['user-agent'],
        ipAddressV4: req.ip || req.connection.remoteAddress
      };

      // Call auth service to login user (it will verify OTP status)
      const result = await authService.loginWithOtp(
        { mobile, email },
        deviceInfo
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default OtpController;
