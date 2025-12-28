import userNotificationService from '#services/userNotificationService.js';
import SocketHelper from '#utils/socketHelper.js';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  notFoundResponse,
  validationErrorResponse 
} from '#utils/responseFormatter.js';

class UserNotificationController {
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

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return validationErrorResponse(res, 'Invalid pagination parameters');
      }

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

      await SocketHelper.emitNotificationCountUpdate(req, userId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to mark notification as read', 500);
    }
  }

  static async markMultipleAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return validationErrorResponse(res, 'Valid notification IDs array is required');
      }

      const validIds = notificationIds.every(id => !isNaN(id));
      if (!validIds) {
        return validationErrorResponse(res, 'All notification IDs must be valid numbers');
      }

      const numericIds = notificationIds.map(id => parseInt(id));
      const result = await userNotificationService.markMultipleAsRead(numericIds, userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      await SocketHelper.emitNotificationCountUpdate(req, userId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to mark notifications as read', 500);
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;

      const result = await userNotificationService.markAllAsRead(userId);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      await SocketHelper.emitNotificationCountUpdate(req, userId);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to mark all notifications as read', 500);
    }
  }

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

  static async updateUserPreferences(req, res) {
    try {
      const userId = req.user.userId;
      const preferencesData = req.body;

      const allowedFields = [
        'notificationsEnabled',
        'listingNotificationsEnabled',
        'chatNotificationsEnabled',
        'subscriptionNotificationsEnabled',
        'systemNotificationsEnabled',
        'securityNotificationsEnabled',
        'marketingNotificationsEnabled'
      ];

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