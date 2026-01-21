import userSearchService from '#services/userSearchService.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class UserSearchController {
  static async logSearch(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const {
        searchQuery,
        filtersApplied = {},
        resultsCount = 0,
        categoryId,
        locationFilters = {},
        priceRange = {}
      } = req.body;

      const trimmedQuery = searchQuery?.trim() || null;

      const searchData = {
        userId: req.user.userId,
        sessionId: req.activityData?.sessionId,
        searchQuery: trimmedQuery,
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

  static async getSearchHistory(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const userId = req.user.userId;
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 50);

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

  static async getSearchRecommendations(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const userId = req.user.userId;
      const { limit = 5 } = req.query;

      const limitNum = Math.min(parseInt(limit), 10);

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