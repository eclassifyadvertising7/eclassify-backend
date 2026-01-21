import otpService from '#services/otpService.js';
import authService from '#services/authService.js';

class OtpController {
  static async sendOtp(req, res) {
    try {
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

  static async verifyOtp(req, res) {
    try {
      const { type, mobile, email, otp } = req.body;

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

  static async completeSignup(req, res) {
    try {
      const { mobile, email, fullName, password, countryCode, referralCode } = req.body;

      const deviceInfo = {
        deviceName: req.body.device_name,
        userAgent: req.headers['user-agent'],
        ipAddressV4: req.ip || req.connection.remoteAddress
      };

      const result = await authService.signupWithOtp(
        { mobile, email, fullName, password, countryCode, referralCode },
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

  static async completeLogin(req, res) {
    try {
      const { username } = req.body;

      const deviceInfo = {
        deviceName: req.body.device_name,
        userAgent: req.headers['user-agent'],
        ipAddressV4: req.ip || req.connection.remoteAddress
      };

      const result = await authService.loginWithOtp(
        { username },
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
