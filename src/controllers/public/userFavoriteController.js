import userFavoriteService from '#services/userFavoriteService.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { ERROR_MESSAGES } from '#utils/constants/messages.js';

class PublicUserFavoriteController {
  /**
   * Get listing favorite count
   * GET /api/public/listings/:listingId/favorite-count
   */
  static async getListingFavoriteCount(req, res) {
    try {
      const { listingId } = req.params;

      // Validate listing ID
      if (!listingId || isNaN(listingId)) {
        return validationErrorResponse(res, [{ field: 'listingId', message: 'Valid listing ID is required' }]);
      }

      const result = await userFavoriteService.getListingFavoriteCount(parseInt(listingId));

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getListingFavoriteCount:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }


}

export default PublicUserFavoriteController;