import subscriptionListingService from '#services/subscriptionListingService.js';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '#utils/responseFormatter.js';

class SubscriptionListingController {
  static async getSubscriptionListings(req, res) {
    try {
      const { subscriptionId } = req.params;
      const { page = 1, limit = 20, status = 'all' } = req.query;
      const userId = req.user.userId; // From auth middleware

      // Validate subscriptionId
      if (!subscriptionId || isNaN(subscriptionId)) {
        return validationErrorResponse(res, 'Invalid subscription ID');
      }

      // Validate status parameter
      const validStatuses = ['all', 'active', 'sold', 'expired', 'rejected', 'pending', 'draft'];
      if (!validStatuses.includes(status)) {
        return validationErrorResponse(res, 'Invalid status. Must be one of: all, active, sold, expired, rejected, pending, draft');
      }

      const listingsData = await subscriptionListingService.getUserSubscriptionListings(
        userId,
        parseInt(subscriptionId),
        { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          status 
        }
      );

      return successResponse(res, listingsData, 'Subscription listings retrieved successfully');
    } catch (error) {
      console.error('Error in getSubscriptionListings:', error);
      
      if (error.message === 'Subscription not found or access denied') {
        return notFoundResponse(res, 'Subscription not found or access denied');
      }
      if (error.message.includes('Invalid')) {
        return validationErrorResponse(res, error.message);
      }
      
      return errorResponse(res, 'Failed to retrieve subscription listings', 500);
    }
  }

  static async getSubscriptionSummary(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware

      const subscriptionSummary = await subscriptionListingService.getUserSubscriptionSummary(userId);

      return successResponse(res, { subscriptions: subscriptionSummary }, 'Subscription summary retrieved successfully');
    } catch (error) {
      console.error('Error in getSubscriptionSummary:', error);
      
      if (error.message.includes('Invalid')) {
        return validationErrorResponse(res, error.message);
      }
      
      return errorResponse(res, 'Failed to retrieve subscription summary', 500);
    }
  }
}

export default SubscriptionListingController;