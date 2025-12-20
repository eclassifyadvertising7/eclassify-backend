import UserSearch from '#models/UserSearch.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';

class UserSearchRepository {
  /**
   * Create a new search log entry
   * @param {Object} searchData - Search data
   * @returns {Promise<Object>} Created search log
   */
  async create(searchData) {
    return await UserSearch.create(searchData);
  }

  /**
   * Find searches with filters
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Searches with pagination
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      userId,
      sessionId,
      categoryId,
      startDate,
      endDate,
      hasResults
    } = filters;

    const {
      limit = 50,
      offset = 0,
      order = [['created_at', 'DESC']]
    } = options;

    const whereClause = {};

    if (userId) whereClause.userId = userId;
    if (sessionId) whereClause.sessionId = sessionId;
    if (categoryId) whereClause.categoryId = categoryId;

    if (hasResults !== undefined) {
      whereClause.resultsCount = hasResults ? { [Op.gt]: 0 } : 0;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await UserSearch.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order,
      include: [
        {
          association: 'user',
          attributes: ['id', 'email']
        },
        {
          association: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    return {
      searches: rows,
      total: count,
      limit,
      offset
    };
  }

  /**
   * Get popular search queries
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Popular search queries
   */
  async getPopularQueries(options = {}) {
    const {
      limit = 10,
      startDate,
      endDate,
      categoryId,
      minSearchCount = 2
    } = options;

    const whereClause = {
      searchQuery: {
        [Op.ne]: null,
        [Op.ne]: ''
      }
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    return await UserSearch.findAll({
      where: whereClause,
      attributes: [
        'searchQuery',
        [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount'],
        [sequelize.fn('AVG', sequelize.col('results_count')), 'avgResults'],
        [sequelize.fn('MAX', sequelize.col('created_at')), 'lastSearched']
      ],
      group: ['searchQuery'],
      having: sequelize.where(
        sequelize.fn('COUNT', sequelize.col('id')),
        Op.gte,
        minSearchCount
      ),
      order: [[sequelize.literal('searchCount'), 'DESC']],
      limit
    });
  }

  /**
   * Get search analytics by time period
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Search analytics
   */
  async getSearchAnalytics(filters = {}) {
    const {
      startDate,
      endDate,
      categoryId,
      groupBy = 'day' // day, week, month
    } = filters;

    const whereClause = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Determine date grouping function
    let dateFunction;
    switch (groupBy) {
      case 'week':
        dateFunction = sequelize.fn('DATE_TRUNC', 'week', sequelize.col('created_at'));
        break;
      case 'month':
        dateFunction = sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'));
        break;
      default:
        dateFunction = sequelize.fn('DATE', sequelize.col('created_at'));
    }

    const analytics = await UserSearch.findAll({
      where: whereClause,
      attributes: [
        [dateFunction, 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSearches'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'uniqueUsers'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('session_id'))), 'uniqueSessions'],
        [sequelize.fn('AVG', sequelize.col('results_count')), 'avgResults'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN results_count > 0 THEN 1 END')), 'successfulSearches']
      ],
      group: [dateFunction],
      order: [[dateFunction, 'DESC']]
    });

    return analytics;
  }

  /**
   * Get top searched categories
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Top categories
   */
  async getTopCategories(options = {}) {
    const {
      limit = 10,
      startDate,
      endDate
    } = options;

    const whereClause = {
      categoryId: { [Op.ne]: null }
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await UserSearch.findAll({
      where: whereClause,
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('UserSearch.id')), 'searchCount'],
        [sequelize.fn('AVG', sequelize.col('results_count')), 'avgResults']
      ],
      include: [
        {
          association: 'category',
          attributes: ['name']
        }
      ],
      group: ['categoryId', 'category.id', 'category.name'],
      order: [[sequelize.literal('searchCount'), 'DESC']],
      limit
    });
  }

  /**
   * Get user search patterns
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User search patterns
   */
  async getUserSearchPatterns(userId, options = {}) {
    const { limit = 30 } = options;

    // Recent searches
    const recentSearches = await UserSearch.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit,
      include: [
        {
          association: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    // Top categories for user
    const topCategories = await UserSearch.findAll({
      where: {
        userId,
        categoryId: { [Op.ne]: null }
      },
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('UserSearch.id')), 'searchCount']
      ],
      include: [
        {
          association: 'category',
          attributes: ['name']
        }
      ],
      group: ['categoryId', 'category.id', 'category.name'],
      order: [[sequelize.literal('searchCount'), 'DESC']],
      limit: 5
    });

    // Search frequency by hour
    const searchByHour = await UserSearch.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM created_at')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount']
      ],
      group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM created_at'))],
      order: [[sequelize.literal('hour'), 'ASC']]
    });

    return {
      recentSearches,
      topCategories,
      searchByHour
    };
  }

  /**
   * Get failed searches (no results)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Failed searches
   */
  async getFailedSearches(options = {}) {
    const {
      limit = 20,
      startDate,
      endDate,
      minOccurrences = 2
    } = options;

    const whereClause = {
      resultsCount: 0,
      searchQuery: {
        [Op.ne]: null,
        [Op.ne]: ''
      }
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await UserSearch.findAll({
      where: whereClause,
      attributes: [
        'searchQuery',
        [sequelize.fn('COUNT', sequelize.col('id')), 'failureCount'],
        [sequelize.fn('MAX', sequelize.col('created_at')), 'lastAttempt']
      ],
      group: ['searchQuery'],
      having: sequelize.where(
        sequelize.fn('COUNT', sequelize.col('id')),
        Op.gte,
        minOccurrences
      ),
      order: [[sequelize.literal('failureCount'), 'DESC']],
      limit
    });
  }

  /**
   * Delete old search records
   * @param {Date} beforeDate - Delete records before this date
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteOldRecords(beforeDate) {
    return await UserSearch.destroy({
      where: {
        createdAt: {
          [Op.lt]: beforeDate
        }
      }
    });
  }

  /**
   * Get search conversion metrics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Conversion metrics
   */
  async getConversionMetrics(filters = {}) {
    const { startDate, endDate } = filters;
    
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalSearches = await UserSearch.count({ where: whereClause });
    
    const searchesWithResults = await UserSearch.count({
      where: {
        ...whereClause,
        resultsCount: { [Op.gt]: 0 }
      }
    });

    const avgResultsPerSearch = await UserSearch.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('results_count')), 'avgResults']
      ]
    });

    return {
      totalSearches,
      searchesWithResults,
      searchesWithoutResults: totalSearches - searchesWithResults,
      successRate: totalSearches > 0 ? ((searchesWithResults / totalSearches) * 100).toFixed(2) : 0,
      avgResults: parseFloat(avgResultsPerSearch?.dataValues?.avgResults || 0).toFixed(2)
    };
  }
}

// Export singleton instance
export default new UserSearchRepository();