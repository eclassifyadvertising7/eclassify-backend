import subscriptionService from '#services/subscriptionService.js';
import {
  successResponse,
  createResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse
} from '#utils/responseFormatter.js';

class SubscriptionController {
  static async getAvailablePlans(req, res) {
    try {
      const result = await subscriptionService.getAvailablePlans();

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getPlansByCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.categoryId);

      if (isNaN(categoryId)) {
        return errorResponse(res, 'Invalid category ID', 400);
      }

      const result = await subscriptionService.getPlansByCategory(categoryId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

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

  static async subscribeToPlan(req, res) {
    try {
      const userId = req.user.userId;
      const { planId, paymentData } = req.body;

      if (!planId) {
        return errorResponse(res, 'Plan ID is required', 400);
      }

      // Payment data is optional for free plans, required for paid plans
      // Service layer will validate based on plan type
      const result = await subscriptionService.subscribeToPlan(
        userId,
        parseInt(planId),
        paymentData || {}
      );

      return createResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

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

  static async getMySubscriptionByCategory(req, res) {
    try {
      const userId = req.user.userId;
      const categoryId = parseInt(req.params.categoryId);

      if (isNaN(categoryId)) {
        return errorResponse(res, 'Invalid category ID', 400);
      }

      const result = await subscriptionService.getActiveSubscriptionByCategory(userId, categoryId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async getAllMyActiveSubscriptions(req, res) {
    try {
      const userId = req.user.userId;

      const result = await subscriptionService.getAllActiveSubscriptions(userId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

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

  static async getMySubscriptionById(req, res) {
    try {
      const userId = req.user.userId;
      const subscriptionId = parseInt(req.params.id);

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      const result = await subscriptionService.getSubscriptionById(subscriptionId);

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

