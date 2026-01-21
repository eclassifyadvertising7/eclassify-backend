import activityLogRepository from '#repositories/activityLogRepository.js';
import activityLogService from '#services/activityLogService.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class PanelUserActivityController {
  static async getActivityAnalytics(req, res) {
    try {
      const {
        startDate,
        endDate,
        activityType,
        userId
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        activityType,
        userId: userId ? parseInt(userId) : undefined
      };

      const result = await activityLogService.getActivityAnalytics(filters);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getActivityAnalytics:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getActivityLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        sessionId,
        activityType,
        targetId,
        startDate,
        endDate,
        ipAddress
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100);

      const filters = {
        userId: userId ? parseInt(userId) : undefined,
        sessionId,
        activityType,
        targetId: targetId ? parseInt(targetId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        ipAddress
      };

      const options = {
        limit: limitNum,
        offset: (pageNum - 1) * limitNum,
        order: [['created_at', 'DESC']]
      };

      const result = await activityLogRepository.findWithFilters(filters, options);

      const totalPages = Math.ceil(result.total / limitNum);

      const responseData = {
        logs: result.logs,
        total: result.total,
        limit: limitNum,
        offset: result.offset,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: result.total,
          itemsPerPage: limitNum
        }
      };

      return successResponse(res, responseData, 'Activity logs retrieved successfully');
    } catch (error) {
      console.error('Error in getActivityLogs:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getActivityCountByType(req, res) {
    try {
      const {
        userId,
        targetId,
        startDate,
        endDate
      } = req.query;

      const filters = {
        userId: userId ? parseInt(userId) : undefined,
        targetId: targetId ? parseInt(targetId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const counts = await activityLogRepository.getActivityCountByType(filters);

      return successResponse(res, counts, 'Activity counts retrieved successfully');
    } catch (error) {
      console.error('Error in getActivityCountByType:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getMostViewedListings(req, res) {
    try {
      const {
        limit = 10,
        startDate,
        endDate
      } = req.query;

      const limitNum = Math.min(parseInt(limit), 50);

      const options = {
        limit: limitNum,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const listings = await activityLogRepository.getMostViewedListings(options);

      return successResponse(res, listings, 'Most viewed listings retrieved successfully');
    } catch (error) {
      console.error('Error in getMostViewedListings:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getConversionRate(req, res) {
    try {
      const {
        startDate,
        endDate,
        targetId
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        targetId: targetId ? parseInt(targetId) : undefined
      };

      const conversionData = await activityLogRepository.getConversionRate(filters);

      return successResponse(res, conversionData, 'Conversion analytics retrieved successfully');
    } catch (error) {
      console.error('Error in getConversionRate:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getUserActivityDetails(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, [{ field: 'userId', message: 'Valid user ID is required' }]);
      }

      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const activitySummary = await activityLogRepository.getUserActivitySummary(parseInt(userId), options);

      return successResponse(res, activitySummary, 'User activity summary retrieved successfully');
    } catch (error) {
      console.error('Error in getUserActivityDetails:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  static async getActivityTrends(req, res) {
    try {
      const {
        startDate,
        endDate,
        activityType,
        groupBy = 'day'
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        activityType,
        groupBy
      };

      const trends = [];

      return successResponse(res, { trends }, 'Activity trends retrieved successfully');
    } catch (error) {
      console.error('Error in getActivityTrends:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }
}

export default PanelUserActivityController;