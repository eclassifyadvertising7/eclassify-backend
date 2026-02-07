import activityLogService from '#services/activityLogService.js';
import { successResponse, errorResponse, paginatedResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class UserActivityController {
  static async getRecentlyViewedListings(req, res) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await activityLogService.getRecentlyViewedListings(userId, {
        page,
        limit
      });

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(
        res,
        result.data.listings,
        result.data.pagination,
        result.message
      );
    } catch (error) {
      console.error('Error in getRecentlyViewedListings:', error);
      return errorResponse(res, ERROR_MESSAGES.SERVER_ERROR, 500);
    }
  }
}

export default UserActivityController;
