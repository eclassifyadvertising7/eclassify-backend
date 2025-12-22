import userFavoriteService from '#services/userFavoriteService.js';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class UserFavoriteController {
  /**
   * Add listing to favorites
   * POST /api/end-user/create/favorites
   */
  static async addFavorite(req, res) {
    try {
      const { listingId } = req.body;
      const userId = req.user?.userId; // ✅ Fixed: use userId instead of id

      // Validate required fields
      if (!listingId) {
        return validationErrorResponse(res, [{ field: 'listingId', message: 'Listing ID is required' }]);
      }

      // Check if user is authenticated
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const result = await userFavoriteService.addFavorite(parseInt(userId), parseInt(listingId));

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 400);
      }
    } catch (error) {
      console.error('Error in addFavorite:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Remove listing from favorites
   * DELETE /api/end-user/delete/favorites/:listingId
   */
  static async removeFavorite(req, res) {
    try {
      const { listingId } = req.params;
      const userId = req.user?.userId; // ✅ Fixed: use userId instead of id

      // Validate listing ID
      if (!listingId || isNaN(listingId)) {
        return validationErrorResponse(res, [{ field: 'listingId', message: 'Valid listing ID is required' }]);
      }

      // Check if user is authenticated
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const result = await userFavoriteService.removeFavorite(parseInt(userId), parseInt(listingId));

      if (result.success) {
        return successResponse(res, null, result.message);
      } else {
        return notFoundResponse(res, result.message);
      }
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get user's favorites
   * GET /api/end-user/get/favorites
   */
  static async getUserFavorites(req, res) {
    try {
      const userId = req.user?.userId; // ✅ Fixed: use userId instead of id
      const {
        page = 1,
        limit = 20,
        categoryId,
        priceMin,
        priceMax,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      // Check if user is authenticated
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 50); // Max 50 items per page

      if (pageNum < 1 || limitNum < 1) {
        return validationErrorResponse(res, [{ field: 'pagination', message: 'Invalid pagination parameters' }]);
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        priceMin: priceMin ? parseFloat(priceMin) : undefined,
        priceMax: priceMax ? parseFloat(priceMax) : undefined,
        sortBy,
        sortOrder: sortOrder.toUpperCase()
      };

      const result = await userFavoriteService.getUserFavorites(parseInt(userId), options);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Check if listing is favorited
   * GET /api/end-user/favorites/check/:listingId
   */
  static async checkFavoriteStatus(req, res) {
    try {
      const { listingId } = req.params;
      const userId = req.user?.userId; // ✅ Fixed: use userId instead of id

      // Validate listing ID
      if (!listingId || isNaN(listingId)) {
        return validationErrorResponse(res, [{ field: 'listingId', message: 'Valid listing ID is required' }]);
      }

      // Check if user is authenticated
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const result = await userFavoriteService.isFavorited(parseInt(userId), parseInt(listingId));

      if (result.success) {
        return successResponse(res, result.data);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in checkFavoriteStatus:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get user's favorite statistics
   * GET /api/end-user/favorites/stats
   */
  static async getFavoriteStats(req, res) {
    try {
      const userId = req.user?.userId; // ✅ Fixed: use userId instead of id

      // Check if user is authenticated
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const result = await userFavoriteService.getFavoriteStats(parseInt(userId));

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getFavoriteStats:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }
}

export default UserFavoriteController;