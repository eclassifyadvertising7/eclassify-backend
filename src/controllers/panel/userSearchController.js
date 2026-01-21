import userSearchRepository from '#repositories/userSearchRepository.js';
import userSearchService from '#services/userSearchService.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class PanelUserSearchController {
  static async getSearchAnalytics(req, res) {
    try {
      const {
        startDate,
        endDate,
        categoryId,
        userId
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        userId: userId ? parseInt(userId) : undefined
      };

      const result = await userSearchService.getSearchAnalytics(filters);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getSearchAnalytics:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getFailedSearches(req, res) {
    try {
      const {
        limit = 20,
        startDate,
        endDate,
        minOccurrences = 2
      } = req.query;

      const limitNum = Math.min(parseInt(limit), 50);

      const options = {
        limit: limitNum,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        minOccurrences: parseInt(minOccurrences)
      };

      const failedSearches = await userSearchRepository.getFailedSearches(options);

      return successResponse(res, { failedSearches }, 'Failed searches retrieved successfully');
    } catch (error) {
      console.error('Error in getFailedSearches:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getConversionMetrics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const metrics = await userSearchRepository.getConversionMetrics(filters);

      return successResponse(res, metrics, 'Search conversion metrics retrieved successfully');
    } catch (error) {
      console.error('Error in getConversionMetrics:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getUserSearchPatterns(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 30 } = req.query;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, [{ field: 'userId', message: 'Valid user ID is required' }]);
      }

      const limitNum = Math.min(parseInt(limit), 100);

      const patterns = await userSearchRepository.getUserSearchPatterns(parseInt(userId), { limit: limitNum });

      return successResponse(res, patterns, 'User search patterns retrieved successfully');
    } catch (error) {
      console.error('Error in getUserSearchPatterns:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getPopularSearches(req, res) {
    try {
      const {
        limit = 10,
        startDate,
        endDate,
        categoryId,
        minSearchCount = 2
      } = req.query;

      const limitNum = Math.min(parseInt(limit), 50);

      const options = {
        limit: limitNum,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        minSearchCount: parseInt(minSearchCount)
      };

      const popularSearches = await userSearchRepository.getPopularQueries(options);

      return successResponse(res, { popularSearches }, 'Popular searches retrieved successfully');
    } catch (error) {
      console.error('Error in getPopularSearches:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getTopCategories(req, res) {
    try {
      const {
        limit = 10,
        startDate,
        endDate
      } = req.query;

      const limitNum = Math.min(parseInt(limit), 20);

      const options = {
        limit: limitNum,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const topCategories = await userSearchRepository.getTopCategories(options);

      return successResponse(res, { topCategories }, 'Top searched categories retrieved successfully');
    } catch (error) {
      console.error('Error in getTopCategories:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getSearchLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        sessionId,
        categoryId,
        startDate,
        endDate,
        hasResults
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100);

      const filters = {
        userId: userId ? parseInt(userId) : undefined,
        sessionId,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        hasResults: hasResults !== undefined ? hasResults === 'true' : undefined
      };

      const options = {
        limit: limitNum,
        offset: (pageNum - 1) * limitNum,
        order: [['created_at', 'DESC']]
      };

      const result = await userSearchRepository.findWithFilters(filters, options);

      const totalPages = Math.ceil(result.total / limitNum);

      const responseData = {
        searches: result.searches,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: result.total,
          itemsPerPage: limitNum
        }
      };

      return successResponse(res, responseData, 'Search logs retrieved successfully');
    } catch (error) {
      console.error('Error in getSearchLogs:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }
}

export default PanelUserSearchController;