import profileService from '#services/profileService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

/**
 * Profile Controller
 * Handles profile operations for all authenticated users (end-users and admins)
 */
class ProfileController {
  /**
   * Get current user's profile
   * @route GET /api/profile/me
   * @access Private (All authenticated users)
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.getProfile(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Update user profile
   * @route PUT /api/profile/me
   * @access Private (All authenticated users)
   */
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

  /**
   * Delete profile photo
   * @route DELETE /api/profile/me/photo
   * @access Private (All authenticated users)
   */
  static async deleteProfilePhoto(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.deleteProfilePhoto(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get business/KYC info
   * @route GET /api/profile/me/business
   * @access Private (All authenticated users)
   */
  static async getBusinessInfo(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.getBusinessInfo(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Update business/KYC info
   * @route PUT /api/profile/me/business
   * @access Private (All authenticated users)
   */
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

  /**
   * Get any user's profile by ID (Admin only)
   * @route GET /api/profile/:userId
   * @access Private (Admin/Super Admin only)
   */
  static async getProfileById(req, res) {
    try {
      const { userId } = req.params;
      const result = await profileService.getProfile(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Update any user's profile by ID (Admin only)
   * @route PUT /api/profile/:userId
   * @access Private (Admin/Super Admin only)
   */
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
}

export default ProfileController;
