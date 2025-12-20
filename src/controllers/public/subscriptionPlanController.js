/**
 * Public Subscription Plan Controller
 * Handles public subscription plan viewing
 */

import subscriptionService from '#services/subscriptionService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class SubscriptionPlanController {
  /**
   * Get all active and visible subscription plans
   * GET /api/public/subscription-plans
   */
  static async getAvailablePlans(req, res) {
    try {
      const result = await subscriptionService.getAvailablePlans();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get subscription plan by ID
   * GET /api/public/subscription-plans/:id
   */
  static async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const result = await subscriptionService.getPlanDetails(parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Get subscription plans by category
   * GET /api/public/subscription-plans/category/:categoryId
   */
  static async getPlansByCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.categoryId);

      if (isNaN(categoryId)) {
        return errorResponse(res, 'Invalid category ID', 400);
      }

      const result = await subscriptionService.getPlansByCategory(categoryId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default SubscriptionPlanController;
