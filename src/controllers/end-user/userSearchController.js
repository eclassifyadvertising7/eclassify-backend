import userSearchService from '#services/userSearchService.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class UserSearchController {
  /**
   * Log search activity
   * POST /api/end-user/searches/log
   */
  static async logSearch(req, res) {
    try {
      const {
        searchQuery,
        filtersApplied = {},
        resultsCount = 0,
        categoryId,
        locationFilters = {},
        priceRange = {}
      } = req.body;

      // Get user data from middleware (supports anonymous users)
      const searchData = {
        userId: req.activityData?.userId || null,
        sessionId: req.activityData?.sessionId,
        searchQuery: searchQuery?.trim() || null,
        filtersApplied,
        resultsCount: parseInt(resultsCount) || 0,
        categoryId: categoryId ? parseInt(categoryId) : null,
        locationFilters,
        priceRange,
        ipAddress: req.activityData?.ipAddress,
        userAgent: req.activityData?.userAgent
      };

      const result = await userSearchService.logSearch(searchData);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 400);
      }
    } catch (error) {
      console.error('Error in logSearch:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get user search history
   * GET /api/end-user/searches/history
   */
  static async getSearchHistory(req, res) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate
      } = req.query;

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 50); // Max 50 items per page

      if (pageNum < 1 || limitNum < 1) {
        return validationErrorResponse(res, [{ field: 'pagination', message: 'Invalid pagination parameters' }]);
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const result = await userSearchService.getUserSearchHistory(userId, options);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getSearchHistory:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get search recommendations
   * GET /api/end-user/searches/recommendations
   */
  static async getSearchRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      const limitNum = Math.min(parseInt(limit), 10); // Max 10 recommendations

      const result = await userSearchService.getUserSearchRecommendations(userId, { limit: limitNum });

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getSearchRecommendations:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }
}

export default UserSearchController;