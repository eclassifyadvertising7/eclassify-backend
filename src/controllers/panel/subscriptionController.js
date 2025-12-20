import subscriptionService from '#services/subscriptionService.js';
import {
  successResponse,
  createResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse
} from '#utils/responseFormatter.js';

/**
 * SubscriptionController (Panel) - Admin manages user subscriptions
 */
class SubscriptionController {
  /**
   * Get all user subscriptions
   * GET /api/panel/subscriptions
   */
  static async getAllSubscriptions(req, res) {
    try {
      const filters = {
        status: req.query.status,
        userId: req.query.userId ? parseInt(req.query.userId) : undefined,
        planId: req.query.planId ? parseInt(req.query.planId) : undefined,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await subscriptionService.getAllSubscriptions(filters, pagination);

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get subscription by ID
   * GET /api/panel/subscriptions/:id
   */
  static async getSubscriptionById(req, res) {
    try {
      const subscriptionId = parseInt(req.params.id);

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      const result = await subscriptionService.getSubscriptionById(subscriptionId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Create subscription manually
   * POST /api/panel/subscriptions
   */
  static async createSubscription(req, res) {
    try {
      const adminUserId = req.user.userId;
      const subscriptionData = req.body;

      const result = await subscriptionService.createSubscriptionManually(
        subscriptionData,
        adminUserId
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
   * Update subscription
   * PUT /api/panel/subscriptions/:id
   */
  static async updateSubscription(req, res) {
    try {
      const subscriptionId = parseInt(req.params.id);
      const adminUserId = req.user.userId;

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      const result = await subscriptionService.updateSubscriptionAdmin(
        subscriptionId,
        req.body,
        adminUserId
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete subscription
   * DELETE /api/panel/subscriptions/:id
   */
  static async deleteSubscription(req, res) {
    try {
      const subscriptionId = parseInt(req.params.id);
      const adminUserId = req.user.userId;

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      const result = await subscriptionService.deleteSubscriptionAdmin(
        subscriptionId,
        adminUserId
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update subscription status
   * PATCH /api/panel/subscriptions/status/:id
   */
  static async updateSubscriptionStatus(req, res) {
    try {
      const subscriptionId = parseInt(req.params.id);
      const adminUserId = req.user.userId;
      const { status } = req.body;

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      const result = await subscriptionService.updateSubscriptionStatus(
        subscriptionId,
        status,
        adminUserId
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Extend subscription
   * POST /api/panel/subscriptions/:id/extend
   */
  static async extendSubscription(req, res) {
    try {
      const subscriptionId = parseInt(req.params.id);
      const adminUserId = req.user.userId;
      const { extensionDays } = req.body;

      if (isNaN(subscriptionId)) {
        return errorResponse(res, 'Invalid subscription ID', 400);
      }

      if (!extensionDays || isNaN(extensionDays)) {
        return errorResponse(res, 'Extension days is required and must be a number', 400);
      }

      const result = await subscriptionService.extendSubscription(
        subscriptionId,
        parseInt(extensionDays),
        adminUserId
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get user subscriptions by category (Admin)
   * GET /api/panel/subscriptions/category/:categoryId
   */
  static async getSubscriptionsByCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.categoryId);

      if (isNaN(categoryId)) {
        return errorResponse(res, 'Invalid category ID', 400);
      }

      const filters = {
        ...req.query,
        categoryId
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      // We'll need to add this method to the service
      const result = await subscriptionService.getSubscriptionsByCategory(filters, pagination);

      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

}

export default SubscriptionController;
