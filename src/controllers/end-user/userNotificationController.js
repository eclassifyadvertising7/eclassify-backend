import userNotificationService from '#services/userNotificationService.js';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  notFoundResponse,
  validationErrorResponse 
} from '#utils/responseFormatter.js';

class UserNotificationController {
  // Get user notifications with pagination and filters
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const {
        page = 1,
        limit = 20,
        status,
        category,
        notificationType,
        isRead,
        startDate,
        endDate,
        includeExpired = false
      } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return validationErrorResponse(res, 'Invalid pagination parameters');
      }

      // Validate boolean parameters
      let isReadBool = undefined;
      if (isRead !== undefined) {
        if (isRead === 'true') isReadBool = true;
        else if (isRead === 'false') isReadBool = false;
        else return validationErrorResponse(res, 'isRead must be true or false');
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        status,
        category,
        notificationType,
        isRead: isReadBool,
        startDate,
        endDate,
        includeExpired: includeExpired === 'true'
      };

      const result = await userNotificationService.getUserNotifications(userId, options);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return paginatedResponse(
        res, 
        result.data.notifications, 
        result.data.pagination, 
        result.message
      );
    } catch (error) {
      return errorResponse(res, 'Failed to fetch notifications', 500);
    }
  }

  // Get single notification by ID
  static async getNotificationById(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, 'Valid notification ID is required');
      }

      const result = await userNotificationService.getNotificationById(parseInt(id), userId);

      if (!result.success) {
        if (result.message.includes('not found')) {
          return notFoundResponse(res, result.message);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch notification', 500);
    }
  }

  // Get unread notifications count
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;

      const result = await userNotificationService.getUnreadCount(userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch unread count', 500);
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, 'Valid notification ID is required');
      }

      const result = await userNotificationService.markAsRead(parseInt(id), userId);

      if (!result.success) {
        if (result.message.includes('not found')) {
          return notFoundResponse(res, result.message);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to mark notification as read', 500);
    }
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return validationErrorResponse(res, 'Valid notification IDs array is required');
      }

      // Validate all IDs are numbers
      const validIds = notificationIds.every(id => !isNaN(id));
      if (!validIds) {
        return validationErrorResponse(res, 'All notification IDs must be valid numbers');
      }

      const numericIds = notificationIds.map(id => parseInt(id));
      const result = await userNotificationService.markMultipleAsRead(numericIds, userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to mark notifications as read', 500);
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;

      const result = await userNotificationService.markAllAsRead(userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to mark all notifications as read', 500);
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, 'Valid notification ID is required');
      }

      const result = await userNotificationService.deleteNotification(parseInt(id), userId);

      if (!result.success) {
        if (result.message.includes('not found')) {
          return notFoundResponse(res, result.message);
        }
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to delete notification', 500);
    }
  }

  // Get notification statistics
  static async getNotificationStats(req, res) {
    try {
      const userId = req.user.userId;
      const { days = 30 } = req.query;

      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return validationErrorResponse(res, 'Days must be between 1 and 365');
      }

      const result = await userNotificationService.getNotificationStats(userId, daysNum);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch notification statistics', 500);
    }
  }

  // Get user notification preferences
  static async getUserPreferences(req, res) {
    try {
      const userId = req.user.userId;

      const result = await userNotificationService.getUserPreferences(userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch notification preferences', 500);
    }
  }

  // Update user notification preferences
  static async updateUserPreferences(req, res) {
    try {
      const userId = req.user.userId;
      const preferencesData = req.body;

      // Only allow users to update category preferences (not channel preferences)
      const allowedFields = [
        'notificationsEnabled',
        'listingNotificationsEnabled',
        'chatNotificationsEnabled',
        'subscriptionNotificationsEnabled',
        'systemNotificationsEnabled',
        'securityNotificationsEnabled',
        'marketingNotificationsEnabled'
      ];

      // Filter out any fields that aren't allowed
      const filteredData = {};
      for (const field of allowedFields) {
        if (preferencesData[field] !== undefined) {
          if (typeof preferencesData[field] !== 'boolean') {
            return validationErrorResponse(res, `${field} must be a boolean value`);
          }
          filteredData[field] = preferencesData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        return validationErrorResponse(res, 'No valid preferences provided');
      }

      const result = await userNotificationService.updateUserPreferences(userId, filteredData);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to update notification preferences', 500);
    }
  }
}

export default UserNotificationController;