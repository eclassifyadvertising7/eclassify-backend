import userNotificationService from '#services/userNotificationService.js';
import adminNotificationService from '#services/adminNotificationService.js';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  validationErrorResponse 
} from '#utils/responseFormatter.js';

class PanelUserNotificationController {
  static async sendBroadcastNotification(req, res) {
    try {
      const {
        targetType = 'specific',
        userIds,
        notificationType,
        category,
        title,
        message,
        data,
        priority = 'normal',
        deliveryMethods = ['in_app'],
        scheduledFor,
        expiresAt,
        actionUrl
      } = req.body;

      if (!['all', 'specific'].includes(targetType)) {
        return validationErrorResponse(res, 'Invalid target type. Must be: all or specific');
      }

      if (targetType === 'specific' && (!userIds || !Array.isArray(userIds) || userIds.length === 0)) {
        return validationErrorResponse(res, 'Valid user IDs array is required for specific targeting');
      }

      if (!title || !message) {
        return validationErrorResponse(res, 'Title and message are required');
      }

      if (!Array.isArray(deliveryMethods) || deliveryMethods.length === 0) {
        return validationErrorResponse(res, 'At least one delivery method is required');
      }

      const validMethods = ['in_app', 'email', 'push'];
      const invalidMethods = deliveryMethods.filter(m => !validMethods.includes(m));
      if (invalidMethods.length > 0) {
        return validationErrorResponse(res, `Invalid delivery methods: ${invalidMethods.join(', ')}`);
      }

      const validCategories = ['listing', 'chat', 'subscription', 'system', 'security', 'marketing'];
      if (category && !validCategories.includes(category)) {
        return validationErrorResponse(res, 'Invalid notification category');
      }

      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return validationErrorResponse(res, 'Invalid notification priority');
      }

      if (targetType === 'specific') {
        const validIds = userIds.every(id => !isNaN(id));
        if (!validIds) {
          return validationErrorResponse(res, 'All user IDs must be valid numbers');
        }
      }

      const notificationData = {
        targetType,
        targetUserIds: targetType === 'specific' ? userIds.map(id => parseInt(id)) : [],
        title,
        message,
        category: category || 'system',
        priority,
        deliveryMethods,
        scheduledFor: scheduledFor || null,
        expiresAt: expiresAt || null,
        actionUrl: actionUrl || null,
        data: data || {},
        createdBy: req.user.userId
      };

      const result = await adminNotificationService.sendNotification(notificationData);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Broadcast notification error:', error);
      return errorResponse(res, 'Failed to send broadcast notification', 500);
    }
  }

  static async sendNotificationToUser(req, res) {
    try {
      const { userId } = req.params;
      const {
        notificationType,
        category,
        title,
        message,
        data,
        priority = 'normal',
        scheduledFor,
        expiresAt,
        listingId,
        chatRoomId,
        subscriptionId,
        invoiceId,
        transactionId
      } = req.body;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Valid user ID is required');
      }

      if (!notificationType || !category || !title || !message) {
        return validationErrorResponse(res, 'notificationType, category, title, and message are required');
      }

      const validCategories = ['listing', 'chat', 'subscription', 'system', 'security', 'marketing'];
      if (!validCategories.includes(category)) {
        return validationErrorResponse(res, 'Invalid notification category');
      }

      const notificationData = {
        userId: parseInt(userId),
        notificationType,
        category,
        title,
        message,
        data,
        priority,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        listingId: listingId ? parseInt(listingId) : null,
        chatRoomId: chatRoomId ? parseInt(chatRoomId) : null,
        subscriptionId: subscriptionId ? parseInt(subscriptionId) : null,
        invoiceId: invoiceId ? parseInt(invoiceId) : null,
        transactionId: transactionId ? parseInt(transactionId) : null,
        createdBy: req.user.userId
      };

      const result = await userNotificationService.createNotification(notificationData);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to send notification', 500);
    }
  }

  static async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 20,
        status,
        category,
        notificationType,
        isRead,
        startDate,
        endDate,
        includeExpired = true
      } = req.query;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Valid user ID is required');
      }

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

      const result = await userNotificationService.getUserNotifications(parseInt(userId), options);

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
      return errorResponse(res, 'Failed to fetch user notifications', 500);
    }
  }

  static async getNotificationStats(req, res) {
    try {
      const { days = 30, category, notificationType } = req.query;

      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return validationErrorResponse(res, 'Days must be between 1 and 365');
      }

      const mockStats = {
        totalNotifications: 0,
        notificationsByCategory: {},
        notificationsByType: {},
        deliveryStats: {
          email: { sent: 0, failed: 0 },
          push: { sent: 0, failed: 0 },
          sms: { sent: 0, failed: 0 }
        },
        period: `${daysNum} days`
      };

      return successResponse(res, mockStats, 'Notification statistics retrieved');
    } catch (error) {
      return errorResponse(res, 'Failed to fetch notification statistics', 500);
    }
  }

  static async getUserPreferences(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Valid user ID is required');
      }

      const result = await userNotificationService.getUserPreferences(parseInt(userId));

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to fetch user notification preferences', 500);
    }
  }

  static async updateUserPreferences(req, res) {
    try {
      const { userId } = req.params;
      const preferencesData = req.body;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Valid user ID is required');
      }

      const booleanFields = [
        'notificationsEnabled', 'emailNotifications', 'pushNotifications', 
        'smsNotifications', 'quietHoursEnabled'
      ];

      for (const field of booleanFields) {
        if (preferencesData[field] !== undefined && typeof preferencesData[field] !== 'boolean') {
          return validationErrorResponse(res, `${field} must be a boolean value`);
        }
      }

      const result = await userNotificationService.updateUserPreferences(parseInt(userId), preferencesData);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to update user notification preferences', 500);
    }
  }

  static async processScheduledNotifications(req, res) {
    try {
      const result = await userNotificationService.processScheduledNotifications();

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to process scheduled notifications', 500);
    }
  }

  static async cleanupExpiredNotifications(req, res) {
    try {
      const { olderThanDays = 180 } = req.body;

      const days = parseInt(olderThanDays);
      if (isNaN(days) || days < 30 || days > 365) {
        return validationErrorResponse(res, 'olderThanDays must be between 30 and 365');
      }

      const result = await userNotificationService.cleanupExpiredNotifications(days);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to cleanup expired notifications', 500);
    }
  }
}

export default PanelUserNotificationController;