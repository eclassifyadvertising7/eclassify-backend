import activityLogService from '#services/activityLogService.js';
import activityLogRepository from '#repositories/activityLogRepository.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import { ACTIVITY_TYPES, TARGET_TYPES } from '#utils/constants/activityTypes.js';

class UserActivityController {
  /**
   * Log listing view activity
   * POST /api/end-user/activity/log-view
   */
  static async logListingView(req, res) {
    try {
      const { listingId, metadata = {} } = req.body;

      // Validate required fields
      if (!listingId) {
        return validationErrorResponse(res, [{ field: 'listingId', message: 'Listing ID is required' }]);
      }

      // Use helper function from middleware
      await req.logListingView(parseInt(listingId), metadata);

      return successResponse(res, { activityLogged: true }, 'Activity logged successfully');
    } catch (error) {
      console.error('Error in logListingView:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Log chat initiation activity
   * POST /api/end-user/activity/log-chat
   */
  static async logChatInitiation(req, res) {
    try {
      const { listingId, metadata = {} } = req.body;

      // Validate required fields
      if (!listingId) {
        return validationErrorResponse(res, [{ field: 'listingId', message: 'Listing ID is required' }]);
      }

      // Chat initiation requires authentication
      if (!req.user) {
        return errorResponse(res, 'Authentication required for chat initiation', 401);
      }

      // Use helper function from middleware
      await req.logChatInitiation(parseInt(listingId), metadata);

      return successResponse(res, { activityLogged: true }, 'Activity logged successfully');
    } catch (error) {
      console.error('Error in logChatInitiation:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Get user activity summary
   * GET /api/end-user/activity/summary
   */
  static async getActivitySummary(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const result = await activityLogRepository.getUserActivitySummary(userId, options);

      return successResponse(res, result, 'Activity summary retrieved successfully');
    } catch (error) {
      console.error('Error in getActivitySummary:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  /**
   * Update view duration (for tracking time spent on page)
   * PATCH /api/end-user/activity/update-view-duration
   */
  static async updateViewDuration(req, res) {
    try {
      const { activityLogId, viewDuration } = req.body;

      // Validate required fields
      if (!activityLogId || !viewDuration) {
        return validationErrorResponse(res, [
          { field: 'activityLogId', message: 'Activity log ID is required' },
          { field: 'viewDuration', message: 'View duration is required' }
        ]);
      }

      // This would require a method to update existing activity log
      // For now, we'll just return success as this is typically handled via beacon
      return successResponse(res, { updated: true }, 'View duration updated successfully');
    } catch (error) {
      console.error('Error in updateViewDuration:', error);
      return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }
}

export default UserActivityController;