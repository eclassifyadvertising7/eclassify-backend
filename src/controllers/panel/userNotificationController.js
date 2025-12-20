import userNotificationService from '#services/userNotificationService.js';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  validationErrorResponse 
} from '#utils/responseFormatter.js';

class PanelUserNotificationController {
  // Send broadcast notification to multiple users
  static async sendBroadcastNotification(req, res) {
    try {
      const {
        userIds,
        notificationType,
        category,
        title,
        message,
        data,
        priority = 'normal',
        scheduledFor,
        expiresAt
      } = req.body;

      // Validate required fields
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return validationErrorResponse(res, 'Valid user IDs array is required');
      }

      if (!notificationType || !category || !title || !message) {
        return validationErrorResponse(res, 'notificationType, category, title, and message are required');
      }

      // Validate category
      const validCategories = ['listing', 'chat', 'subscription', 'system', 'security', 'marketing'];
      if (!validCategories.includes(category)) {
        return validationErrorResponse(res, 'Invalid notification category');
      }

      // Validate priority
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return validationErrorResponse(res, 'Invalid notification priority');
      }

      // Validate user IDs are numbers
      const validIds = userIds.every(id => !isNaN(id));
      if (!validIds) {
        return validationErrorResponse(res, 'All user IDs must be valid numbers');
      }

      // Create notifications for all users
      const notifications = userIds.map(userId => ({
        userId: parseInt(userId),
        notificationType,
        category,
        title,
        message,
        data,
        priority,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user.userId
      }));

      const result = await userNotificationService.createBulkNotifications(notifications);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, 'Failed to send broadcast notification', 500);
    }
  }

  // Send notification to single user (admin action)
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

      // Validate user ID
      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Valid user ID is required');
      }

      // Validate required fields
      if (!notificationType || !category || !title || !message) {
        return validationErrorResponse(res, 'notificationType, category, title, and message are required');
      }

      // Validate category
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

  // Get user's notifications (admin view)
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
        includeExpired = true // Admin can see expired notifications
      } = req.query;

      // Validate user ID
      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Valid user ID is required');
      }

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

  // Get notification statistics for admin dashboard
  static async getNotificationStats(req, res) {
    try {
      const { days = 30, category, notificationType } = req.query;

      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return validationErrorResponse(res, 'Days must be between 1 and 365');
      }

      // TODO: Implement admin-level notification statistics
      // This would require additional repository methods to get system-wide stats
      
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

  // Get user's notification preferences (admin view)
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

  // Update user's notification preferences (admin action)
  static async updateUserPreferences(req, res) {
    try {
      const { userId } = req.params;
      const preferencesData = req.body;

      if (!userId || isNaN(userId)) {
        return validationErrorResponse(res, 'Valid user ID is required');
      }

      // Validate required fields if provided
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

  // Process scheduled notifications manually (admin action)
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

  // Cleanup expired notifications manually (admin action)
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