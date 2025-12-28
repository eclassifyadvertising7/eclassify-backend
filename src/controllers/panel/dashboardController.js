import dashboardService from '#services/dashboardService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class DashboardController {
  static async getOverviewStats(req, res) {
    try {
      const result = await dashboardService.getOverviewStats();

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return errorResponse(res, 'Failed to fetch dashboard overview', 500);
    }
  }

  static async getDetailedStats(req, res) {
    try {
      const { period = 'all' } = req.query;

      const validPeriods = ['all', 'today', 'week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        return errorResponse(res, 'Invalid period. Must be one of: all, today, week, month, year', 400);
      }

      const result = await dashboardService.getDetailedStats(period);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
      return errorResponse(res, 'Failed to fetch detailed statistics', 500);
    }
  }
}

export default DashboardController;
