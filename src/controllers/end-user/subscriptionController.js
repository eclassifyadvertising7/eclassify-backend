import subscriptionService from '#services/subscriptionService.js';
import {
  successResponse,
  createResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse
} from '#utils/responseFormatter.js';

/**
 * SubscriptionController - Handle user subscription operations
 */
class SubscriptionController {
  /**
   * Get available plans for end users
   * GET /api/end-user/subscriptions/plans
   */
  static async getAvailablePlans(req, res) {
    try {
      const result = await subscriptionService.getAvailablePlans();

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get plan details
   * GET /api/end-user/subscriptions/plans/:id
   */
  static async getPlanDetails(req, res) {
    try {
      const planId = parseInt(req.params.id);

      if (isNaN(planId)) {
        return errorResponse(res, 'Invalid plan ID', 400);
      }

      const result = await subscriptionService.getPlanDetails(planId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not available')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Subscribe to plan
   * POST /api/end-user/subscriptions
   */
  static async subscribeToPlan(req, res) {
    try {
      const userId = req.user.userId;
      const { planId, paymentData } = req.body;

      if (!planId) {
        return errorResponse(res, 'Plan ID is required', 400);
      }

      if (!paymentData || !paymentData.paymentMethod || !paymentData.transactionId) {
        return errorResponse(res, 'Payment data with payment method and transaction ID are required', 400);
      }

      const result = await subscriptionService.subscribeToPlan(
        userId,
        parseInt(planId),
        paymentData
      );

      return createResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get user's active subscription
   * GET /api/end-user/subscriptions/active
   */
  static async getMySubscription(req, res) {
    try {
      const userId = req.user.userId;

      const result = await subscriptionService.getActiveSubscription(userId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get user's subscription history
   * GET /api/end-user/subscriptions/history
   */
  static async getSubscriptionHistory(req, res) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await subscriptionService.getSubscriptionHistory(userId, {
        page,
        limit
      });

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Cancel subscription
   * POST /api/end-user/subscriptions/:id/cancel
   */
  static async cancelSubscription(req, res) {
    try {
      const userId = req.user.userId;
      const subscriptionId = parseInt(req.params.id);
      const { reason } = req.body;

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      const result = await subscriptionService.cancelSubscription(
        userId,
        subscriptionId,
        reason || null
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      if (error.message.includes('Unauthorized')) {
        return errorResponse(res, error.message, 403);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get all my subscriptions (with filters)
   * GET /api/end-user/subscriptions
   */
  static async getMySubscriptions(req, res) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const filters = { userId };
      if (status) {
        filters.status = status;
      }

      const result = await subscriptionService.getAllSubscriptions(filters, { page, limit });

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get subscription by ID (my subscription only)
   * GET /api/end-user/subscriptions/:id
   */
  static async getMySubscriptionById(req, res) {
    try {
      const userId = req.user.userId;
      const subscriptionId = parseInt(req.params.id);

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      const result = await subscriptionService.getSubscriptionById(subscriptionId);

      // Check if subscription belongs to user
      if (result.data.userId !== userId) {
        return errorResponse(res, 'Unauthorized access', 403);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }
}

export default SubscriptionController;

