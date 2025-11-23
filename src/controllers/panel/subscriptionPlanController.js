import subscriptionService from '#services/subscriptionService.js';
import {
  successResponse,
  createResponse,
  errorResponse,
  notFoundResponse
} from '#utils/responseFormatter.js';

/**
 * SubscriptionPlanController - Handle subscription plan management (Super Admin)
 */
class SubscriptionPlanController {
  /**
   * Create new subscription plan
   * POST /api/panel/subscription-plans
   */
  static async createPlan(req, res) {
    try {
      const userId = req.user.userId;
      const userName = req.user.fullName || 'Admin';

      const result = await subscriptionService.createPlan(req.body, userId, userName);

      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update subscription plan (auto-detects version need)
   * PUT /api/panel/subscription-plans/:id
   */
  static async updatePlan(req, res) {
    try {
      const planId = parseInt(req.params.id);
      const userId = req.user.userId;
      const userName = req.user.fullName || 'Admin';

      if (isNaN(planId)) {
        return errorResponse(res, 'Invalid plan ID', 400);
      }

      const result = await subscriptionService.updatePlan(
        planId,
        req.body,
        userId,
        userName
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
   * Get all plans (admin view)
   * GET /api/panel/subscription-plans
   */
  static async getAllPlans(req, res) {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
        planCode: req.query.planCode
      };

      const result = await subscriptionService.getAllPlans(filters);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get plan by ID
   * GET /api/panel/subscription-plans/:id
   */
  static async getPlanById(req, res) {
    try {
      const planId = parseInt(req.params.id);

      if (isNaN(planId)) {
        return errorResponse(res, 'Invalid plan ID', 400);
      }

      const result = await subscriptionService.getPlanById(planId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Delete plan (soft delete)
   * DELETE /api/panel/subscription-plans/:id
   */
  static async deletePlan(req, res) {
    try {
      const planId = parseInt(req.params.id);
      const userId = req.user.userId;

      if (isNaN(planId)) {
        return errorResponse(res, 'Invalid plan ID', 400);
      }

      const result = await subscriptionService.deletePlan(planId, userId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update plan status
   * PATCH /api/panel/subscription-plans/status/:id
   */
  static async updateStatus(req, res) {
    try {
      const planId = parseInt(req.params.id);
      const { isActive } = req.body;
      const userId = req.user.userId;
      const userName = req.user.fullName || 'Admin';

      if (isNaN(planId)) {
        return errorResponse(res, 'Invalid plan ID', 400);
      }

      if (typeof isActive !== 'boolean') {
        return errorResponse(res, 'isActive must be a boolean value', 400);
      }

      const result = await subscriptionService.updatePlanStatus(
        planId,
        isActive,
        userId,
        userName
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
   * Update plan visibility
   * PATCH /api/panel/subscription-plans/visibility/:id
   */
  static async updateVisibility(req, res) {
    try {
      const planId = parseInt(req.params.id);
      const { isPublic } = req.body;
      const userId = req.user.userId;
      const userName = req.user.fullName || 'Admin';

      if (isNaN(planId)) {
        return errorResponse(res, 'Invalid plan ID', 400);
      }

      if (typeof isPublic !== 'boolean') {
        return errorResponse(res, 'isPublic must be a boolean value', 400);
      }

      const result = await subscriptionService.updatePlanVisibility(
        planId,
        isPublic,
        userId,
        userName
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      if (error.message.includes('not found')) {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, error.message, 400);
    }
  }
}

export default SubscriptionPlanController;
