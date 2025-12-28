import adminNotificationService from '#services/adminNotificationService.js';
import {
  successResponse,
  errorResponse,
  validationErrorResponse
} from '#utils/responseFormatter.js';

class NotificationManagementController {
  static async sendNotification(req, res) {
    try {
      const adminUserId = req.user.userId;
      const {
        targetType,
        targetUserIds,
        title,
        message,
        category,
        priority,
        deliveryMethods,
        scheduledFor,
        expiresAt,
        actionUrl,
        data
      } = req.body;

      if (!title || !message) {
        return validationErrorResponse(res, 'Title and message are required');
      }

      if (!targetType || !['all', 'specific', 'role', 'subscription'].includes(targetType)) {
        return validationErrorResponse(res, 'Invalid target type. Must be: all, specific, role, or subscription');
      }

      if (targetType === 'specific' && (!targetUserIds || !Array.isArray(targetUserIds) || targetUserIds.length === 0)) {
        return validationErrorResponse(res, 'Target user IDs are required for specific targeting');
      }

      if (!deliveryMethods || !Array.isArray(deliveryMethods) || deliveryMethods.length === 0) {
        return validationErrorResponse(res, 'At least one delivery method is required');
      }

      const validMethods = ['in_app', 'email', 'sms', 'whatsapp'];
      const invalidMethods = deliveryMethods.filter(m => !validMethods.includes(m));
      if (invalidMethods.length > 0) {
        return validationErrorResponse(res, `Invalid delivery methods: ${invalidMethods.join(', ')}`);
      }

      const notificationData = {
        targetType,
        targetUserIds,
        title,
        message,
        category: category || 'system',
        priority: priority || 'normal',
        deliveryMethods,
        scheduledFor: scheduledFor || null,
        expiresAt: expiresAt || null,
        actionUrl: actionUrl || null,
        data: data || {},
        createdBy: adminUserId
      };

      const result = await adminNotificationService.sendNotification(notificationData);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Send notification error:', error);
      return errorResponse(res, error.message || 'Failed to send notification', 500);
    }
  }

  static async sendBulkNotifications(req, res) {
    try {
      const adminUserId = req.user.userId;
      const { notifications } = req.body;

      if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
        return validationErrorResponse(res, 'Notifications array is required');
      }

      if (notifications.length > 100) {
        return validationErrorResponse(res, 'Maximum 100 notifications can be sent at once');
      }

      for (const notification of notifications) {
        notification.createdBy = adminUserId;
      }

      const result = await adminNotificationService.sendBulkNotifications(notifications);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      return errorResponse(res, error.message || 'Failed to send bulk notifications', 500);
    }
  }

  static async getNotificationStats(req, res) {
    try {
      const { days = 30 } = req.query;

      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return validationErrorResponse(res, 'Days must be between 1 and 365');
      }

      const result = await adminNotificationService.getNotificationStats(daysNum);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Get notification stats error:', error);
      return errorResponse(res, 'Failed to fetch notification statistics', 500);
    }
  }

  static async getDeliveryReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return validationErrorResponse(res, 'Start date and end date are required');
      }

      const result = await adminNotificationService.getDeliveryReport(startDate, endDate);

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Get delivery report error:', error);
      return errorResponse(res, 'Failed to fetch delivery report', 500);
    }
  }
}

export default NotificationManagementController;
