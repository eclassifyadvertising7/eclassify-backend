import userManagementService from '#services/userManagementService.js';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '#utils/responseFormatter.js';

class UserManagementController {
  // List external users (user role)
  static async listExternalUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '', status, startDate, endDate } = req.query;

      const result = await userManagementService.listExternalUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        startDate,
        endDate
      });

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in listExternalUsers:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // List internal users (admin, marketing, seo, etc.)
  static async listInternalUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '', status, startDate, endDate } = req.query;

      const result = await userManagementService.listInternalUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        startDate,
        endDate
      });

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in listInternalUsers:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Get user details
  static async getUserDetails(req, res) {
    try {
      const { userId } = req.params;

      const result = await userManagementService.getUserDetails(userId);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in getUserDetails:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Create new user
  static async createUser(req, res) {
    try {
      const userData = req.body;
      const createdBy = req.user.userId;

      const result = await userManagementService.createUser(userData, createdBy);

      if (!result.success) {
        return validationErrorResponse(res, [{ field: 'general', message: result.message }]);
      }

      return successResponse(res, result.data, result.message, 201);
    } catch (error) {
      console.error('Error in createUser:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Toggle user status (activate/deactivate)
  static async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return validationErrorResponse(res, [{ field: 'isActive', message: 'isActive must be a boolean' }]);
      }

      const result = await userManagementService.toggleUserStatus(userId, isActive);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const deletedBy = req.user.userId;

      const result = await userManagementService.deleteUser(userId, deletedBy);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Update KYC status
  static async updateKycStatus(req, res) {
    try {
      const { userId } = req.params;
      const { kycStatus } = req.body;

      if (!kycStatus) {
        return validationErrorResponse(res, [{ field: 'kycStatus', message: 'KYC status is required' }]);
      }

      const result = await userManagementService.updateKycStatus(userId, kycStatus);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in updateKycStatus:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Make user verified
  static async makeUserVerified(req, res) {
    try {
      const { userId } = req.params;

      const result = await userManagementService.makeUserVerified(userId);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in makeUserVerified:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Toggle auto-approve for user
  static async toggleAutoApprove(req, res) {
    try {
      const { userId } = req.params;
      const { isEnabled } = req.body;

      if (typeof isEnabled !== 'boolean') {
        return validationErrorResponse(res, [{ field: 'isEnabled', message: 'isEnabled must be a boolean' }]);
      }

      const result = await userManagementService.toggleAutoApprove(userId, isEnabled);

      if (!result.success) {
        return notFoundResponse(res, result.message);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in toggleAutoApprove:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }

  // Get user statistics
  static async getUserStatistics(req, res) {
    try {
      const result = await userManagementService.getUserStatistics();

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in getUserStatistics:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }
}

export default UserManagementController;
