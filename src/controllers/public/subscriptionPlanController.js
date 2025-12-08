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
      const result = await subscriptionService.getPlanById(parseInt(id), true);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
}

export default SubscriptionPlanController;
