import userNotificationRepository from '#repositories/userNotificationRepository.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '#utils/constants/messages.js';

class UserNotificationService {
  static instance = null;

  static getInstance() {
    if (!UserNotificationService.instance) {
      UserNotificationService.instance = new UserNotificationService();
    }
    return UserNotificationService.instance;
  }

  // Create a single notification
  async createNotification(notificationData) {
    try {
      // Validate required fields
      if (!notificationData.userId || !notificationData.notificationType || 
          !notificationData.category || !notificationData.title || !notificationData.message) {
        throw new Error('Missing required notification fields');
      }

      // Validate category
      const validCategories = ['listing', 'chat', 'subscription', 'system', 'security', 'marketing'];
      if (!validCategories.includes(notificationData.category)) {
        throw new Error('Invalid notification category');
      }

      // Validate priority
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (notificationData.priority && !validPriorities.includes(notificationData.priority)) {
        throw new Error('Invalid notification priority');
      }

      // Set default values
      const notification = {
        ...notificationData,
        priority: notificationData.priority || 'normal',
        status: notificationData.scheduledFor ? 'scheduled' : 'unread',
        deliveryMethod: notificationData.deliveryMethod || 'in_app'
      };

      const createdNotification = await userNotificationRepository.create(notification);

      // If not scheduled, process delivery immediately
      if (!notification.scheduledFor) {
        await this.processNotificationDelivery(createdNotification);
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATION_CREATED,
        data: createdNotification
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATION_CREATE_FAILED,
        data: null
      };
    }
  }

  // Create multiple notifications in bulk
  async createBulkNotifications(notifications) {
    try {
      // Validate all notifications
      for (const notification of notifications) {
        if (!notification.userId || !notification.notificationType || 
            !notification.category || !notification.title || !notification.message) {
          throw new Error('Missing required fields in one or more notifications');
        }
      }

      // Set default values for all notifications
      const processedNotifications = notifications.map(notification => ({
        ...notification,
        priority: notification.priority || 'normal',
        status: notification.scheduledFor ? 'scheduled' : 'unread',
        deliveryMethod: notification.deliveryMethod || 'in_app'
      }));

      const createdNotifications = await userNotificationRepository.createBulk(processedNotifications);

      // Process delivery for non-scheduled notifications
      const immediateNotifications = createdNotifications.filter(n => !n.scheduledFor);
      for (const notification of immediateNotifications) {
        await this.processNotificationDelivery(notification);
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATIONS_CREATED,
        data: { count: createdNotifications.length, notifications: createdNotifications }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATIONS_CREATE_FAILED,
        data: null
      };
    }
  }

  // Get user notifications with filters
  async getUserNotifications(userId, options = {}) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await userNotificationRepository.findByUserId(userId, options);

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATIONS_RETRIEVED,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATIONS_FETCH_FAILED,
        data: null
      };
    }
  }

  // Get single notification
  async getNotificationById(notificationId, userId) {
    try {
      if (!notificationId || !userId) {
        throw new Error('Notification ID and User ID are required');
      }

      const notification = await userNotificationRepository.findByIdAndUserId(notificationId, userId);
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATION_RETRIEVED,
        data: notification
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATION_NOT_FOUND,
        data: null
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      if (!notificationId || !userId) {
        throw new Error('Notification ID and User ID are required');
      }

      const success = await userNotificationRepository.markAsRead(notificationId, userId);
      
      if (!success) {
        throw new Error('Notification not found or already read');
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATION_MARKED_READ,
        data: { notificationId, readAt: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATION_UPDATE_FAILED,
        data: null
      };
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds, userId) {
    try {
      if (!notificationIds || !Array.isArray(notificationIds) || !userId) {
        throw new Error('Valid notification IDs array and User ID are required');
      }

      const affectedRows = await userNotificationRepository.markMultipleAsRead(notificationIds, userId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATIONS_MARKED_READ,
        data: { count: affectedRows, readAt: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATIONS_UPDATE_FAILED,
        data: null
      };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const affectedRows = await userNotificationRepository.markAllAsRead(userId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.ALL_NOTIFICATIONS_MARKED_READ,
        data: { count: affectedRows, readAt: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATIONS_UPDATE_FAILED,
        data: null
      };
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const count = await userNotificationRepository.getUnreadCount(userId);
      const countByCategory = await userNotificationRepository.getUnreadCountByCategory(userId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.UNREAD_COUNT_RETRIEVED,
        data: { 
          total: count,
          byCategory: countByCategory
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.UNREAD_COUNT_FAILED,
        data: null
      };
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      if (!notificationId || !userId) {
        throw new Error('Notification ID and User ID are required');
      }

      const success = await userNotificationRepository.deleteById(notificationId, userId);
      
      if (!success) {
        throw new Error('Notification not found');
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATION_DELETED,
        data: { notificationId }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATION_DELETE_FAILED,
        data: null
      };
    }
  }

  // Get notification statistics
  async getNotificationStats(userId, days = 30) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const stats = await userNotificationRepository.getNotificationStats(userId, days);

      return {
        success: true,
        message: SUCCESS_MESSAGES.NOTIFICATION_STATS_RETRIEVED,
        data: { stats, period: `${days} days` }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.NOTIFICATION_STATS_FAILED,
        data: null
      };
    }
  }

  // User preferences methods
  async getUserPreferences(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const preferences = await userNotificationRepository.getUserPreferences(userId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.PREFERENCES_RETRIEVED,
        data: preferences
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.PREFERENCES_FETCH_FAILED,
        data: null
      };
    }
  }

  async updateUserPreferences(userId, preferencesData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate preference structure
      const validCategories = ['listing', 'chat', 'subscription', 'system', 'security', 'marketing'];
      const validChannels = ['in_app', 'email', 'push', 'sms'];

      // Validate category preferences if provided
      for (const category of validCategories) {
        const categoryKey = `${category}Notifications`;
        if (preferencesData[categoryKey]) {
          for (const channel of validChannels) {
            if (preferencesData[categoryKey][channel] !== undefined && 
                typeof preferencesData[categoryKey][channel] !== 'boolean') {
              throw new Error(`Invalid ${channel} preference for ${category} category`);
            }
          }
        }
      }

      const preferences = await userNotificationRepository.updateUserPreferences(userId, preferencesData);

      return {
        success: true,
        message: SUCCESS_MESSAGES.PREFERENCES_UPDATED,
        data: preferences
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.PREFERENCES_UPDATE_FAILED,
        data: null
      };
    }
  }

  // Process scheduled notifications (called by cron job)
  async processScheduledNotifications() {
    try {
      const scheduledNotifications = await userNotificationRepository.findScheduledNotifications();
      
      let processedCount = 0;
      for (const notification of scheduledNotifications) {
        try {
          // Update status to unread
          await userNotificationRepository.markAsRead(notification.id, null); // System update
          
          // Process delivery
          await this.processNotificationDelivery(notification);
          processedCount++;
        } catch (error) {
          console.error(`Failed to process scheduled notification ${notification.id}:`, error);
        }
      }

      return {
        success: true,
        message: `Processed ${processedCount} scheduled notifications`,
        data: { processedCount, totalFound: scheduledNotifications.length }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to process scheduled notifications',
        data: null
      };
    }
  }

  // Cleanup expired notifications (called by cron job)
  async cleanupExpiredNotifications(olderThanDays = 180) {
    try {
      const expiredNotifications = await userNotificationRepository.findExpiredNotifications(olderThanDays);
      
      if (expiredNotifications.length === 0) {
        return {
          success: true,
          message: 'No expired notifications to cleanup',
          data: { deletedCount: 0 }
        };
      }

      const notificationIds = expiredNotifications.map(n => n.id);
      const deletedCount = await userNotificationRepository.deleteExpiredNotifications(notificationIds);

      return {
        success: true,
        message: `Cleaned up ${deletedCount} expired notifications`,
        data: { deletedCount }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to cleanup expired notifications',
        data: null
      };
    }
  }

  // Process notification delivery based on user preferences
  async processNotificationDelivery(notification) {
    try {
      // Get user preferences
      const preferencesResult = await this.getUserPreferences(notification.userId);
      if (!preferencesResult.success) {
        console.error('Failed to get user preferences for notification delivery');
        return;
      }

      const preferences = preferencesResult.data;
      
      // Check if notifications are globally enabled
      if (!preferences.notificationsEnabled) {
        return;
      }

      // Get category-specific preferences
      const categoryKey = `${notification.category}Notifications`;
      const categoryPrefs = preferences[categoryKey] || {};

      // Check quiet hours (for push and SMS only)
      const isQuietHours = this.isQuietHours(preferences);

      // Process each delivery method
      if (categoryPrefs.email && preferences.emailNotifications) {
        await this.sendEmailNotification(notification);
      }

      if (categoryPrefs.push && preferences.pushNotifications && !isQuietHours) {
        await this.sendPushNotification(notification);
      }

      if (categoryPrefs.sms && preferences.smsNotifications && !isQuietHours) {
        await this.sendSMSNotification(notification);
      }

    } catch (error) {
      console.error('Failed to process notification delivery:', error);
    }
  }

  // Check if current time is within quiet hours
  isQuietHours(preferences) {
    if (!preferences.quietHoursEnabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS format
    
    const startTime = preferences.quietHoursStart;
    const endTime = preferences.quietHoursEnd;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  // Placeholder methods for actual delivery (to be implemented with real services)
  async sendEmailNotification(notification) {
    try {
      // Get user email
      const user = await userNotificationRepository.getUserById(notification.userId);
      if (!user || !user.email) {
        console.log(`No email found for user ${notification.userId}`);
        await userNotificationRepository.updateDeliveryStatus(notification.id, 'email', false);
        return;
      }

      // Import email service dynamically to avoid circular dependencies
      const { default: emailService } = await import('#services/emailService.js');
      
      // Send email notification
      const emailSent = await emailService.sendNotification(
        user.email,
        notification.title,
        notification.message,
        {
          actionUrl: notification.actionUrl,
          actionText: notification.actionText
        }
      );
      
      // Update delivery status
      await userNotificationRepository.updateDeliveryStatus(notification.id, 'email', emailSent);
      
      if (emailSent) {
        console.log(`Email notification ${notification.id} sent successfully to ${user.email}`);
      } else {
        console.error(`Failed to send email notification ${notification.id} to ${user.email}`);
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
      await userNotificationRepository.updateDeliveryStatus(notification.id, 'email', false);
    }
  }

  async sendPushNotification(notification) {
    try {
      // TODO: Implement actual push notification with FCM
      console.log(`Sending push notification ${notification.id} to user ${notification.userId}`);
      
      // Update delivery status
      await userNotificationRepository.updateDeliveryStatus(notification.id, 'push', true);
    } catch (error) {
      console.error('Failed to send push notification:', error);
      await userNotificationRepository.updateDeliveryStatus(notification.id, 'push', false);
    }
  }

  async sendSMSNotification(notification) {
    try {
      // TODO: Implement actual SMS sending
      console.log(`Sending SMS notification ${notification.id} to user ${notification.userId}`);
      
      // Update delivery status
      await userNotificationRepository.updateDeliveryStatus(notification.id, 'sms', true);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      await userNotificationRepository.updateDeliveryStatus(notification.id, 'sms', false);
    }
  }

  // Helper methods for creating specific notification types
  async createListingNotification(userId, type, listingData, additionalData = {}) {
    const notificationData = {
      userId,
      notificationType: type,
      category: 'listing',
      listingId: listingData.id,
      data: {
        listingTitle: listingData.title,
        listingSlug: listingData.slug,
        ...additionalData
      },
      ...this.getNotificationContent(type, listingData, additionalData)
    };

    return await this.createNotification(notificationData);
  }

  async createChatNotification(userId, type, chatData, additionalData = {}) {
    const notificationData = {
      userId,
      notificationType: type,
      category: 'chat',
      chatRoomId: chatData.chatRoomId,
      listingId: chatData.listingId,
      data: {
        senderName: chatData.senderName,
        listingTitle: chatData.listingTitle,
        ...additionalData
      },
      ...this.getNotificationContent(type, chatData, additionalData)
    };

    return await this.createNotification(notificationData);
  }

  async createSubscriptionNotification(userId, type, subscriptionData, additionalData = {}) {
    const notificationData = {
      userId,
      notificationType: type,
      category: 'subscription',
      subscriptionId: subscriptionData.id,
      data: {
        planName: subscriptionData.planName,
        ...additionalData
      },
      ...this.getNotificationContent(type, subscriptionData, additionalData)
    };

    return await this.createNotification(notificationData);
  }

  // Get notification content based on type
  getNotificationContent(type, data, additionalData = {}) {
    const contentMap = {
      // Listing notifications
      listing_approved: {
        title: 'Your listing has been approved!',
        message: `Your listing '${data.title}' is now live and visible to buyers.`,
        priority: 'high'
      },
      listing_rejected: {
        title: 'Listing needs attention',
        message: `Your listing '${data.title}' was rejected. Please review and resubmit.`,
        priority: 'high'
      },
      listing_expired: {
        title: 'Listing expired',
        message: `Your listing '${data.title}' has expired. Renew to keep it active.`,
        priority: 'normal'
      },
      listing_expiring_soon: {
        title: 'Listing expiring soon',
        message: `Your listing '${data.title}' expires in ${additionalData.daysRemaining || 3} days.`,
        priority: 'normal'
      },

      // Chat notifications
      new_message: {
        title: `New message from ${data.senderName}`,
        message: `You have a new message about your ${data.listingTitle} listing.`,
        priority: 'normal'
      },
      offer_made: {
        title: 'New offer received',
        message: `${data.senderName} made an offer of ₹${additionalData.amount} on your ${data.listingTitle}.`,
        priority: 'high'
      },

      // Subscription notifications
      subscription_expiring: {
        title: 'Subscription expiring soon',
        message: `Your ${data.planName} expires in ${additionalData.daysRemaining} days. Renew now to continue.`,
        priority: 'high'
      },
      payment_successful: {
        title: 'Payment successful',
        message: `Your payment of ₹${additionalData.amount} for ${data.planName} was successful.`,
        priority: 'normal'
      }
    };

    return contentMap[type] || {
      title: 'Notification',
      message: 'You have a new notification.',
      priority: 'normal'
    };
  }
}

export default UserNotificationService.getInstance();