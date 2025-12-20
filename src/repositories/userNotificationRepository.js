import { Op } from 'sequelize';
import UserNotification from '#models/UserNotification.js';
import UserNotificationPreference from '#models/UserNotificationPreference.js';

class UserNotificationRepository {
  static instance = null;

  static getInstance() {
    if (!UserNotificationRepository.instance) {
      UserNotificationRepository.instance = new UserNotificationRepository();
    }
    return UserNotificationRepository.instance;
  }

  // Create single notification
  async create(notificationData) {
    return await UserNotification.create(notificationData);
  }

  // Create multiple notifications in bulk
  async createBulk(notifications) {
    return await UserNotification.bulkCreate(notifications);
  }

  // Find notifications by user ID with pagination and filters
  async findByUserId(userId, options = {}) {
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
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    // Apply filters
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (notificationType) whereClause.notificationType = notificationType;
    if (typeof isRead === 'boolean') whereClause.isRead = isRead;

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    // Exclude expired notifications unless explicitly requested
    if (!includeExpired) {
      whereClause[Op.or] = [
        { expiresAt: null },
        { expiresAt: { [Op.gt]: new Date() } }
      ];
    }

    const { count, rows } = await UserNotification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit,
      offset,
      attributes: [
        'id', 'notificationType', 'category', 'title', 'message', 'data',
        'listingId', 'chatRoomId', 'subscriptionId', 'invoiceId', 'transactionId',
        'status', 'priority', 'isRead', 'readAt', 'expiresAt',
        ['created_at', 'createdAt'], ['updated_at', 'updatedAt']
      ]
    });

    return {
      notifications: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Get single notification by ID and user ID
  async findByIdAndUserId(notificationId, userId) {
    return await UserNotification.findOne({
      where: { id: notificationId, userId },
      attributes: [
        'id', 'notificationType', 'category', 'title', 'message', 'data',
        'listingId', 'chatRoomId', 'subscriptionId', 'invoiceId', 'transactionId',
        'status', 'priority', 'isRead', 'readAt', 'expiresAt',
        ['created_at', 'createdAt'], ['updated_at', 'updatedAt']
      ]
    });
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const [affectedRows] = await UserNotification.update(
      { 
        isRead: true, 
        readAt: new Date(),
        status: 'read'
      },
      { 
        where: { id: notificationId, userId },
        userId // For audit trail
      }
    );
    return affectedRows > 0;
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds, userId) {
    const [affectedRows] = await UserNotification.update(
      { 
        isRead: true, 
        readAt: new Date(),
        status: 'read'
      },
      { 
        where: { 
          id: { [Op.in]: notificationIds }, 
          userId 
        },
        userId // For audit trail
      }
    );
    return affectedRows;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    const [affectedRows] = await UserNotification.update(
      { 
        isRead: true, 
        readAt: new Date(),
        status: 'read'
      },
      { 
        where: { userId, isRead: false },
        userId // For audit trail
      }
    );
    return affectedRows;
  }

  // Get unread count for user
  async getUnreadCount(userId) {
    return await UserNotification.count({
      where: { 
        userId, 
        isRead: false,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      }
    });
  }

  // Get unread count by category
  async getUnreadCountByCategory(userId) {
    const results = await UserNotification.findAll({
      where: { 
        userId, 
        isRead: false,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      },
      attributes: [
        'category',
        [UserNotification.sequelize.fn('COUNT', UserNotification.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    return results.reduce((acc, item) => {
      acc[item.category] = parseInt(item.count);
      return acc;
    }, {});
  }

  // Delete notification (soft delete)
  async deleteById(notificationId, userId) {
    const [affectedRows] = await UserNotification.update(
      { deletedBy: userId },
      { 
        where: { id: notificationId, userId },
        userId // For audit trail
      }
    );
    
    if (affectedRows > 0) {
      await UserNotification.destroy({
        where: { id: notificationId, userId }
      });
      return true;
    }
    return false;
  }

  // Find scheduled notifications ready to be sent
  async findScheduledNotifications() {
    return await UserNotification.findAll({
      where: {
        scheduledFor: { [Op.lte]: new Date() },
        status: 'scheduled'
      },
      order: [['scheduled_for', 'ASC']],
      limit: 100 // Process in batches
    });
  }

  // Find expired notifications for cleanup
  async findExpiredNotifications(olderThanDays = 180) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return await UserNotification.findAll({
      where: {
        [Op.or]: [
          { expiresAt: { [Op.lt]: new Date() } },
          { createdAt: { [Op.lt]: cutoffDate } }
        ]
      },
      paranoid: false, // Include soft-deleted records
      limit: 1000 // Process in batches
    });
  }

  // Hard delete expired notifications
  async deleteExpiredNotifications(notificationIds) {
    return await UserNotification.destroy({
      where: { id: { [Op.in]: notificationIds } },
      force: true // Hard delete
    });
  }

  // Update delivery status
  async updateDeliveryStatus(notificationId, deliveryType, success = true) {
    const updateData = {};
    const timestamp = new Date();

    switch (deliveryType) {
      case 'email':
        updateData.emailSent = success;
        if (success) updateData.emailSentAt = timestamp;
        break;
      case 'push':
        updateData.pushSent = success;
        if (success) updateData.pushSentAt = timestamp;
        break;
      case 'sms':
        updateData.smsSent = success;
        if (success) updateData.smsSentAt = timestamp;
        break;
    }

    const [affectedRows] = await UserNotification.update(updateData, {
      where: { id: notificationId }
    });
    return affectedRows > 0;
  }

  // Get notification statistics
  async getNotificationStats(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await UserNotification.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        'category',
        'status',
        [UserNotification.sequelize.fn('COUNT', UserNotification.sequelize.col('id')), 'count']
      ],
      group: ['category', 'status'],
      raw: true
    });

    return stats.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {};
      }
      acc[item.category][item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  // User notification preferences methods
  async getUserPreferences(userId) {
    let preferences = await UserNotificationPreference.findOne({
      where: { userId }
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await UserNotificationPreference.create({ userId });
    }

    return preferences;
  }

  async updateUserPreferences(userId, preferencesData) {
    const [preferences, created] = await UserNotificationPreference.findOrCreate({
      where: { userId },
      defaults: { userId, ...preferencesData }
    });

    if (!created) {
      await preferences.update(preferencesData);
    }

    return preferences;
  }
}

export default UserNotificationRepository.getInstance();