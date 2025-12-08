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
   * Verify OTP and complete signup/login
   * @route POST /api/auth/otp/verify
   */
  static async verifyOtp(req, res) {
    try {
      const { type, mobile, otp, fullName, countryCode } = req.body;

      // Step 1: Verify OTP
      await otpService.verifyOtp({ mobile, otp, type });

      // Step 2: Handle authentication based on type
      const deviceInfo = {
        deviceName: req.body.device_name,
        userAgent: req.headers['user-agent'],
        ipAddressV4: req.ip || req.connection.remoteAddress
      };

      let result;
      if (type === 'signup') {
        result = await authService.signupWithOtp(
          { mobile, fullName, countryCode },
          deviceInfo
        );
      } else if (type === 'login') {
        result = await authService.loginWithOtp(
          { mobile },
          deviceInfo
        );
      } else {
        throw new Error('Invalid type. Must be signup or login');
      }

      const statusCode = type === 'signup' ? 201 : 200;
      return res.status(statusCode).json(result);
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
