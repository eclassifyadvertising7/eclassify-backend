import models from '#models/index.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';

const { UserActivityLog } = models;

class ActivityLogRepository {
  async create(activityData) {
    return await UserActivityLog.create(activityData);
  }

  async findExisting(filters) {
    const { userId, sessionId, activityType, targetId, targetType } = filters;
    
    const whereClause = {
      activityType,
      targetId,
      targetType
    };

    if (userId) {
      whereClause.userId = userId;
    } else if (sessionId) {
      whereClause.sessionId = sessionId;
      whereClause.userId = null;
    }

    return await UserActivityLog.findOne({
      where: whereClause,
      attributes: ['id']
    });
  }

  /**
   * Find activity logs with filters
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options (limit, offset, order)
   * @returns {Promise<Object>} Activity logs with pagination
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      userId,
      sessionId,
      activityType,
      targetId,
      targetType,
      startDate,
      endDate,
      ipAddress
    } = filters;

    const {
      limit = 50,
      offset = 0,
      order = [['created_at', 'DESC']]
    } = options;

    const whereClause = {};

    if (userId) whereClause.userId = userId;
    if (sessionId) whereClause.sessionId = sessionId;
    if (activityType) whereClause.activityType = activityType;
    if (targetId) whereClause.targetId = targetId;
    if (targetType) whereClause.targetType = targetType;
    if (ipAddress) whereClause.ipAddress = ipAddress;

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: endDate
      };
    }

    const { count, rows } = await UserActivityLog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order,
      include: [
        {
          association: 'user',
          attributes: ['id', 'email', 'mobile']
        }
      ]
    });

    return {
      logs: rows,
      total: count,
      limit,
      offset
    };
  }

  /**
   * Get activity count by type
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Activity counts grouped by type
   */
  async getActivityCountByType(filters = {}) {
    const { userId, startDate, endDate, targetId } = filters;
    
    const whereClause = {};
    
    if (userId) whereClause.userId = userId;
    if (targetId) whereClause.targetId = targetId;
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await UserActivityLog.findAll({
      where: whereClause,
      attributes: [
        'activityType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['activityType'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
  }

  /**
   * Get most viewed listings
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Most viewed listings
   */
  async getMostViewedListings(options = {}) {
    const {
      limit = 10,
      startDate,
      endDate
    } = options;

    const whereClause = {
      activityType: 'view_listing_detail'
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await UserActivityLog.findAll({
      where: whereClause,
      attributes: [
        'targetId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'viewCount'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'uniqueUsers']
      ],
      group: ['targetId'],
      order: [[sequelize.literal('viewCount'), 'DESC']],
      limit,
      include: [
        {
          association: 'listing',
          attributes: ['id', 'title', 'price', 'status']
        }
      ]
    });
  }

  /**
   * Get conversion rate (views to chat initiations)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Conversion analytics
   */
  async getConversionRate(filters = {}) {
    const { startDate, endDate, targetId } = filters;
    
    const whereClause = {};
    
    if (targetId) whereClause.targetId = targetId;
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const results = await UserActivityLog.findAll({
      where: whereClause,
      attributes: [
        'activityType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['activityType']
    });

    const analytics = results.reduce((acc, result) => {
      acc[result.activityType] = parseInt(result.dataValues.count);
      return acc;
    }, {});

    const views = analytics.view_listing_detail || 0;
    const chats = analytics.initiate_chat || 0;
    const conversionRate = views > 0 ? ((chats / views) * 100).toFixed(2) : 0;

    return {
      totalViews: views,
      totalChats: chats,
      conversionRate: parseFloat(conversionRate)
    };
  }

  /**
   * Get user activity summary
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User activity summary
   */
  async getUserActivitySummary(userId, options = {}) {
    const { startDate, endDate } = options;
    
    const whereClause = { userId };
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const activities = await UserActivityLog.findAll({
      where: whereClause,
      attributes: [
        'activityType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('target_id'))), 'uniqueTargets']
      ],
      group: ['activityType']
    });

    return activities.reduce((acc, activity) => {
      acc[activity.activityType] = {
        count: parseInt(activity.dataValues.count),
        uniqueTargets: parseInt(activity.dataValues.uniqueTargets)
      };
      return acc;
    }, {});
  }

  /**
   * Delete old activity logs (for data retention)
   * @param {Date} beforeDate - Delete logs before this date
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteOldLogs(beforeDate) {
    const result = await UserActivityLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: beforeDate
        }
      }
    });

    return result;
  }
}

// Export singleton instance
export default new ActivityLogRepository();