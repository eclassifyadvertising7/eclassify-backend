import userProfileService from '#services/userProfileService.js';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '#utils/responseFormatter.js';

class UserController {
  static async getUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const { listingsPerCategory = 3 } = req.query;

      console.log('getUserProfile - userId from params:', userId, 'type:', typeof userId);
      console.log('getUserProfile - isNaN(userId):', isNaN(userId));
      console.log('getUserProfile - parseInt(userId):', parseInt(userId));

      // Validate userId
      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Invalid user ID');
      }

      // Validate listingsPerCategory
      const validListingsPerCategory = Math.min(Math.max(1, parseInt(listingsPerCategory)), 10);

      const profileData = await userProfileService.getUserPublicProfile(
        parseInt(userId), 
        { listingsPerCategory: validListingsPerCategory }
      );

      return successResponse(res, profileData, 'User profile retrieved successfully');
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      
      if (error.message === 'User not found') {
        return notFoundResponse(res, 'User not found');
      }
      if (error.message === 'Invalid user ID') {
        return validationErrorResponse(res, 'Invalid user ID');
      }
      
      return errorResponse(res, 'Failed to retrieve user profile', 500);
    }
  }

  static async getUserCategoryListings(req, res) {
    try {
      const { userId, categoryId } = req.params;
      const { page = 1, limit = 20, status = 'all' } = req.query;

      // Validate parameters
      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Invalid user ID');
      }
      
      if (!categoryId || isNaN(categoryId)) {
        return validationErrorResponse(res, 'Invalid category ID');
      }

      // Validate status parameter
      const validStatuses = ['all', 'draft', 'pending', 'active', 'expired', 'sold', 'rejected'];
      if (!validStatuses.includes(status)) {
        return validationErrorResponse(res, 'Invalid status. Must be one of: all, draft, pending, active, expired, sold, rejected');
      }

      const listingsData = await userProfileService.getUserCategoryListings(
        parseInt(userId),
        parseInt(categoryId),
        { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          status 
        }
      );

      return successResponse(res, listingsData, 'Category listings retrieved successfully');
    } catch (error) {
      console.error('Error in getUserCategoryListings:', error);
      
      if (error.message === 'User or category not found') {
        return notFoundResponse(res, 'User or category not found');
      }
      if (error.message.includes('Invalid')) {
        return validationErrorResponse(res, error.message);
      }
      
      return errorResponse(res, 'Failed to retrieve category listings', 500);
    }
  }
}

export default UserController;