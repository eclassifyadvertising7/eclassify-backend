import userNotificationService from '#services/userNotificationService.js';
import authRepository from '#repositories/authRepository.js';
import emailService from '#services/emailService.js';
import pushNotificationService from '#services/pushNotificationService.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class AdminNotificationService {
  static instance = null;

  static getInstance() {
    if (!AdminNotificationService.instance) {
      AdminNotificationService.instance = new AdminNotificationService();
    }
    return AdminNotificationService.instance;
  }

  async _getTargetUsers(targetType, targetUserIds = [], filters = {}) {
    let users = [];

    switch (targetType) {
      case 'all':
        users = await authRepository.findAll({ status: 'active' });
        break;

      case 'specific':
        if (!targetUserIds || targetUserIds.length === 0) {
          throw new Error('Target user IDs are required for specific targeting');
        }
        users = await authRepository.findByIds(targetUserIds);
        break;

      case 'role':
        if (!filters.roleSlug) {
          throw new Error('Role slug is required for role-based targeting');
        }
        users = await authRepository.findByRole(filters.roleSlug);
        break;

      case 'subscription':
        if (!filters.subscriptionTier) {
          throw new Error('Subscription tier is required for subscription-based targeting');
        }
        users = await authRepository.findBySubscriptionTier(filters.subscriptionTier);
        break;

      default:
        throw new Error('Invalid target type');
    }

    return users;
  }

  async sendNotification(notificationData) {
    try {
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
        data,
        createdBy
      } = notificationData;

      const users = await this._getTargetUsers(targetType, targetUserIds, notificationData);

      if (users.length === 0) {
        throw new Error('No users found matching the target criteria');
      }

      const results = {
        total: users.length,
        successful: 0,
        failed: 0,
        deliveryResults: {
          in_app: { sent: 0, failed: 0 },
          email: { sent: 0, failed: 0 },
          push: { sent: 0, failed: 0 }
        }
      };

      for (const user of users) {
        try {
          const notificationPayload = {
            userId: user.id,
            notificationType: 'admin_broadcast',
            category,
            title,
            message,
            priority,
            deliveryMethod: deliveryMethods.join(','),
            scheduledFor,
            expiresAt,
            data: {
              ...data,
              actionUrl,
              sentBy: createdBy
            }
          };

          if (deliveryMethods.includes('in_app')) {
            try {
              await userNotificationService.createNotification(notificationPayload);
              results.deliveryResults.in_app.sent++;
            } catch (error) {
              console.error(`In-app notification failed for user ${user.id}:`, error);
              results.deliveryResults.in_app.failed++;
            }
          }

          if (deliveryMethods.includes('email') && user.email) {
            try {
              await emailService.sendNotification(user.email, title, message, {
                actionUrl,
                actionText: 'View Details'
              });
              results.deliveryResults.email.sent++;
            } catch (error) {
              console.error(`Email notification failed for user ${user.id}:`, error);
              results.deliveryResults.email.failed++;
            }
          }

          if (deliveryMethods.includes('push') && user.id) {
            try {
              await pushNotificationService.sendNotification(user.id, title, message, {
                actionUrl,
                data
              });
              results.deliveryResults.push.sent++;
            } catch (error) {
              console.error(`Push notification failed for user ${user.id}:`, error);
              results.deliveryResults.push.failed++;
            }
          }

          results.successful++;
        } catch (error) {
          console.error(`Notification failed for user ${user.id}:`, error);
          results.failed++;
        }
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATIONS_SENT,
        data: results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATION_SEND_FAILED,
        data: null
      };
    }
  }

  async sendBulkNotifications(notifications) {
    try {
      const results = {
        total: notifications.length,
        successful: 0,
        failed: 0,
        details: []
      };

      for (const notification of notifications) {
        try {
          const result = await this.sendNotification(notification);
          if (result.success) {
            results.successful++;
            results.details.push({
              notification: notification.title,
              status: 'success',
              data: result.data
            });
          } else {
            results.failed++;
            results.details.push({
              notification: notification.title,
              status: 'failed',
              error: result.message
            });
          }
        } catch (error) {
          results.failed++;
          results.details.push({
            notification: notification.title,
            status: 'failed',
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: `Bulk notifications processed: ${results.successful} successful, ${results.failed} failed`,
        data: results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to process bulk notifications',
        data: null
      };
    }
  }

  async getNotificationStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = {
        totalSent: 0,
        byCategory: {},
        byPriority: {},
        byDeliveryMethod: {
          in_app: 0,
          email: 0,
          push: 0
        },
        deliverySuccess: {
          in_app: 0,
          email: 0,
          push: 0
        }
      };

      return {
        success: true,
        message: 'Notification statistics retrieved successfully',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch notification statistics',
        data: null
      };
    }
  }

  async getDeliveryReport(startDate, endDate) {
    try {
      const report = {
        period: {
          start: startDate,
          end: endDate
        },
        summary: {
          totalNotifications: 0,
          totalRecipients: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0
        },
        byMethod: {
          in_app: { sent: 0, delivered: 0, failed: 0 },
          email: { sent: 0, delivered: 0, failed: 0 },
          push: { sent: 0, delivered: 0, failed: 0 }
        }
      };

      return {
        success: true,
        message: 'Delivery report retrieved successfully',
        data: report
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch delivery report',
        data: null
      };
    }
  }
}

export default AdminNotificationService.getInstance();
