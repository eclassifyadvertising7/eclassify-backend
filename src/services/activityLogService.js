import UserActivityLog from '#models/UserActivityLog.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';

class ActivityLogService {
  /**
   * Log user activity
   * @param {Object} activityData - Activity data
   * @param {number|null} activityData.userId - User ID (null for anonymous)
   * @param {string} activityData.sessionId - Session ID
   * @param {string} activityData.activityType - Type of activity
   * @param {number} activityData.targetId - Target resource ID
   * @param {string} activityData.targetType - Target resource type
   * @param {Object} activityData.metadata - Additional metadata
   * @param {string} activityData.ipAddress - User IP address
   * @param {string} activityData.userAgent - User agent string
   * @returns {Promise<Object>} Service response
   */
  async logActivity(activityData) {
    try {
      const {
        userId,
        sessionId,
        activityType,
        targetId,
        targetType,
        metadata = {},
        ipAddress,
        userAgent
      } = activityData;

      // Validate required fields
      if (!sessionId || !activityType || !targetId || !targetType) {
        throw new Error('Missing required fields for activity logging');
      }

      // Create activity log entry
      const activityLog = await UserActivityLog.create({
        userId,
        sessionId,
        activityType,
        targetId,
        targetType,
        metadata,
        ipAddress,
        userAgent,
        createdAt: new Date()
      });

      return {
        success: true,
        message: 'Activity logged successfully',
        data: { activityLogId: activityLog.id }
      };
    } catch (error) {
      console.error('Error logging activity:', error);
      return {
        success: false,
        message: 'Failed to log activity',
        error: error.message
      };
    }
  }

  /**
   * Log listing detail view
   * @param {Object} viewData - View data
   * @param {number|null} viewData.userId - User ID
   * @param {string} viewData.sessionId - Session ID
   * @param {number} viewData.listingId - Listing ID
   * @param {Object} viewData.metadata - View metadata (duration, referrer, etc.)
   * @param {string} viewData.ipAddress - IP address
   * @param {string} viewData.userAgent - User agent
   * @returns {Promise<Object>} Service response
   */
  async logListingView(viewData) {
    const { listingId, ...otherData } = viewData;
    
    return this.logActivity({
      ...otherData,
      activityType: 'view_listing_detail',
      targetId: listingId,
      targetType: 'listing'
    });
  }

  /**
   * Log chat initiation
   * @param {Object} chatData - Chat data
   * @param {number} chatData.userId - User ID (required for chat)
   * @param {string} chatData.sessionId - Session ID
   * @param {number} chatData.listingId - Listing ID
   * @param {Object} chatData.metadata - Chat metadata (seller_id, chat_room_id, etc.)
   * @param {string} chatData.ipAddress - IP address
   * @param {string} chatData.userAgent - User agent
   * @returns {Promise<Object>} Service response
   */
  async logChatInitiation(chatData) {
    const { listingId, ...otherData } = chatData;
    
    return this.logActivity({
      ...otherData,
      activityType: 'initiate_chat',
      targetId: listingId,
      targetType: 'listing'
    });
  }

  /**
   * Generate session ID for anonymous users
   * @returns {string} Session ID
   */
  generateSessionId() {
    return uuidv4();
  }

  /**
   * Get user activity analytics
   * @param {Object} filters - Filter options
   * @param {Date} filters.startDate - Start date
   * @param {Date} filters.endDate - End date
   * @param {string} filters.activityType - Activity type filter
   * @param {number} filters.userId - User ID filter
   * @returns {Promise<Object>} Analytics data
   */
  async getActivityAnalytics(filters = {}) {
    try {
      const { startDate, endDate, activityType, userId } = filters;
      
      const whereClause = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      if (activityType) {
        whereClause.activityType = activityType;
      }
      
      if (userId) {
        whereClause.userId = userId;
      }

      const analytics = await UserActivityLog.findAll({
        where: whereClause,
        attributes: [
          'activityType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date']
        ],
        group: ['activityType', sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']]
      });

      return {
        success: true,
        message: 'Analytics retrieved successfully',
        data: analytics
      };
    } catch (error) {
      console.error('Error getting activity analytics:', error);
      return {
        success: false,
        message: 'Failed to retrieve analytics',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export default new ActivityLogService();