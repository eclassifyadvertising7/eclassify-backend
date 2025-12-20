import userFavoriteRepository from '#repositories/userFavoriteRepository.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class PanelUserFavoriteController {
  /**
   * Get most favorited listings
   * GET /api/panel/favorites/analytics/most-favorited
   */
  static async getMostFavoritedListings(req, res) {
    try {
      const {
        limit = 10,
        categoryId,
        startDate,
        endDate
      } = req.query;

      const limitNum = Math.min(parseInt(limit), 50); // Max 50 results

      const options = {
        limit: limitNum,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const listings = await userFavoriteRepository.getMostFavoritedListings(options);

      return successResponse(res, { listings }, 'Most favorited listings retrieved successfully');
    } catch (error) {
      console.error('Error in getMostFavoritedListings:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get favorite analytics
   * GET /api/panel/favorites/analytics/stats
   */
  static async getFavoriteAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const stats = await userFavoriteRepository.getFavoriteStats(filters);

      return successResponse(res, stats, 'Favorite analytics retrieved successfully');
    } catch (error) {
      console.error('Error in getFavoriteAnalytics:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get user favorites (admin view)
   * GET /api/panel/favorites/user/:userId
   */
  static async getUserFavorites(req, res) {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 20,
        categoryId,
        priceMin,
        priceMax
      } = req.query;

      // Validate user ID
      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, [{ field: 'userId', message: 'Valid user ID is required' }]);
      }

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 50);

      const filters = {
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        priceMin: priceMin ? parseFloat(priceMin) : undefined,
        priceMax: priceMax ? parseFloat(priceMax) : undefined
      };

      const options = {
        limit: limitNum,
        offset: (pageNum - 1) * limitNum,
        order: [['created_at', 'DESC']]
      };

      const result = await userFavoriteRepository.getUserFavorites(parseInt(userId), filters, options);

      const totalPages = Math.ceil(result.total / limitNum);

      const responseData = {
        favorites: result.favorites,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: result.total,
          itemsPerPage: limitNum
        }
      };

      return successResponse(res, responseData, 'User favorites retrieved successfully');
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get favorites by category breakdown
   * GET /api/panel/favorites/analytics/by-category
   */
  static async getFavoritesByCategory(req, res) {
    try {
      const { userId, startDate, endDate } = req.query;

      // If userId provided, get for specific user, otherwise get overall stats
      let categoryBreakdown;

      if (userId) {
        categoryBreakdown = await userFavoriteRepository.getFavoritesByCategory(parseInt(userId));
      } else {
        // This would need a method to get overall category breakdown
        // For now, return empty array
        categoryBreakdown = [];
      }

      return successResponse(res, { categoryBreakdown }, 'Favorites by category retrieved successfully');
    } catch (error) {
      console.error('Error in getFavoritesByCategory:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }
}

export default PanelUserFavoriteController;