import subscriptionService from '#services/subscriptionService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class SubscriptionPlanController {
  static async getAvailablePlans(req, res) {
    try {
      const result = await subscriptionService.getAvailablePlans();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const result = await subscriptionService.getPlanDetails(parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
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
      return errorResponse(res, error.message, 400);
    }
  }
}

export default SubscriptionPlanController;
