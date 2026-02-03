import profileService from '#services/profileService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class ProfileController {
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.getProfile(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profileData = req.body;
      const file = req.file;

      const result = await profileService.updateProfile(userId, profileData, file);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteProfilePhoto(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.deleteProfilePhoto(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getBusinessInfo(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.getBusinessInfo(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async updateBusinessInfo(req, res) {
    try {
      const userId = req.user.userId;
      const businessData = req.body;

      const result = await profileService.updateBusinessInfo(userId, businessData);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updatePreferredLocation(req, res) {
    try {
      const userId = req.user.userId;
      const locationData = req.body;

      const result = await profileService.updatePreferredLocation(userId, locationData);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getPreferredLocation(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.getPreferredLocation(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getProfileById(req, res) {
    try {
      const { userId } = req.params;
      const result = await profileService.getProfile(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async updateProfileById(req, res) {
    try {
      const { userId } = req.params;
      const profileData = req.body;
      const file = req.file;

      const result = await profileService.updateProfile(userId, profileData, file);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      const result = await profileService.changePassword(userId, currentPassword, newPassword);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ProfileController;
