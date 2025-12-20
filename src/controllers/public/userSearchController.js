import userSearchService from '#services/userSearchService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class PublicUserSearchController {
  /**
   * Get popular searches (public endpoint)
   * GET /api/public/searches/popular
   */
  static async getPopularSearches(req, res) {
    try {
      const {
        limit = 10,
        categoryId,
        startDate,
        endDate
      } = req.query;

      const limitNum = Math.min(parseInt(limit), 20); // Max 20 for public endpoint

      const options = {
        limit: limitNum,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const result = await userSearchService.getPopularSearches(options);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getPopularSearches:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }
}

export default PublicUserSearchController;