import authService from '#services/authService.js';
import { 
  createResponse, 
  successResponse, 
  errorResponse 
} from '#utils/responseFormatter.js';

class AuthController {
  static async signup(req, res) {
    try {
      const deviceInfo = {
        deviceName: req.body.device_name,
        userAgent: req.headers['user-agent'],
        ipAddressV4: req.ip || req.connection.remoteAddress
      };
      
      const result = await authService.signup(req.body, deviceInfo);
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

  static async login(req, res) {
    try {
      const deviceInfo = {
        deviceName: req.body.device_name,
        userAgent: req.headers['user-agent'],
        ipAddressV4: req.ip || req.connection.remoteAddress
      };
      
      const result = await authService.login(req.body, deviceInfo);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const result = await authService.getProfile(req.user.userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;
      const result = await authService.refreshToken(refresh_token);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }

  static async logout(req, res) {
    try {
      const { refresh_token } = req.body;
      const result = await authService.logout(refresh_token);
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

export default AuthController;
