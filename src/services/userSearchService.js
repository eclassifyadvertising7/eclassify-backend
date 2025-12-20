import UserSearch from '#models/UserSearch.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';

class UserSearchService {
  /**
   * Log user search activity
   * @param {Object} searchData - Search data
   * @param {number|null} searchData.userId - User ID (null for anonymous)
   * @param {string} searchData.sessionId - Session ID
   * @param {string} searchData.searchQuery - Search query text
   * @param {Object} searchData.filtersApplied - Applied filters
   * @param {number} searchData.resultsCount - Number of results returned
   * @param {number} searchData.categoryId - Category ID if filtered
   * @param {Object} searchData.locationFilters - Location filters
   * @param {Object} searchData.priceRange - Price range filters
   * @param {string} searchData.ipAddress - IP address
   * @param {string} searchData.userAgent - User agent
   * @returns {Promise<Object>} Service response
   */
  async logSearch(searchData) {
    try {
      const {
        userId,
        sessionId,
        searchQuery,
        filtersApplied = {},
        resultsCount = 0,
        categoryId,
        locationFilters = {},
        priceRange = {},
        ipAddress,
        userAgent
      } = searchData;

      // Validate required fields
      if (!sessionId) {
        throw new Error('Session ID is required for search logging');
      }

      // Create search log entry
      const searchLog = await UserSearch.create({
        userId,
        sessionId,
        searchQuery: searchQuery?.trim() || null,
        filtersApplied,
        resultsCount,
        categoryId,
        locationFilters,
        priceRange,
        ipAddress,
        userAgent,
        createdAt: new Date()
      });

      return {
        success: true,
        message: 'Search logged successfully',
        data: { searchLogId: searchLog.id }
      };
    } catch (error) {
      console.error('Error logging search:', error);
      return {
        success: false,
        message: 'Failed to log search',
        error: error.message
      };
    }
  }

  /**
   * Get user's search history
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Service response
   */
  async getUserSearchHistory(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate
      } = options;

      const offset = (page - 1) * limit;
      
      const whereClause = { userId };
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const { count, rows } = await UserSearch.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            association: 'category',
            attributes: ['id', 'name']
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        message: 'Search history retrieved successfully',
        data: {
          searches: rows,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit
          }
        }
      };
    } catch (error) {
      console.error('Error getting search history:', error);
      return {
        success: false,
        message: 'Failed to retrieve search history',
        error: error.message
      };
    }
  }

  /**
   * Get popular search queries
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Service response
   */
  async getPopularSearches(options = {}) {
    try {
      const {
        limit = 10,
        startDate,
        endDate,
        categoryId
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

      const popularSearches = await UserSearch.findAll({
        where: whereClause,
        attributes: [
          'searchQuery',
          [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount'],
          [sequelize.fn('AVG', sequelize.col('results_count')), 'avgResults']
        ],
        group: ['searchQuery'],
        order: [[sequelize.literal('searchCount'), 'DESC']],
        limit
      });

      return {
        success: true,
        message: 'Popular searches retrieved successfully',
        data: { popularSearches }
      };
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return {
        success: false,
        message: 'Failed to retrieve popular searches',
        error: error.message
      };
    }
  }

  /**
   * Get search analytics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Service response
   */
  async getSearchAnalytics(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        categoryId,
        userId
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

      if (userId) {
        whereClause.userId = userId;
      }

      // Total searches
      const totalSearches = await UserSearch.count({ where: whereClause });

      // Searches with results vs no results
      const searchesWithResults = await UserSearch.count({
        where: {
          ...whereClause,
          resultsCount: { [Op.gt]: 0 }
        }
      });

      const searchesWithoutResults = totalSearches - searchesWithResults;

      // Average results per search
      const avgResults = await UserSearch.findOne({
        where: whereClause,
        attributes: [
          [sequelize.fn('AVG', sequelize.col('results_count')), 'avgResults']
        ]
      });

      // Top categories searched
      const topCategories = await UserSearch.findAll({
        where: {
          ...whereClause,
          categoryId: { [Op.ne]: null }
        },
        attributes: [
          'categoryId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount']
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

      // Daily search trends
      const dailyTrends = await UserSearch.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount']
        ],
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
        limit: 30
      });

      return {
        success: true,
        message: 'Search analytics retrieved successfully',
        data: {
          totalSearches,
          searchesWithResults,
          searchesWithoutResults,
          successRate: totalSearches > 0 ? ((searchesWithResults / totalSearches) * 100).toFixed(2) : 0,
          avgResults: parseFloat(avgResults?.dataValues?.avgResults || 0).toFixed(2),
          topCategories,
          dailyTrends
        }
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {
        success: false,
        message: 'Failed to retrieve search analytics',
        error: error.message
      };
    }
  }

  /**
   * Get user search recommendations based on history
   * @param {number} userId - User ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Service response
   */
  async getUserSearchRecommendations(userId, options = {}) {
    try {
      const { limit = 5 } = options;

      // Get user's most searched categories
      const topCategories = await UserSearch.findAll({
        where: {
          userId,
          categoryId: { [Op.ne]: null }
        },
        attributes: [
          'categoryId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount']
        ],
        group: ['categoryId'],
        order: [[sequelize.literal('searchCount'), 'DESC']],
        limit
      });

      // Get user's recent search queries (excluding duplicates)
      const recentQueries = await UserSearch.findAll({
        where: {
          userId,
          searchQuery: {
            [Op.ne]: null,
            [Op.ne]: ''
          }
        },
        attributes: ['searchQuery'],
        group: ['searchQuery'],
        order: [['created_at', 'DESC']],
        limit
      });

      return {
        success: true,
        message: 'Search recommendations retrieved successfully',
        data: {
          topCategories,
          recentQueries: recentQueries.map(s => s.searchQuery)
        }
      };
    } catch (error) {
      console.error('Error getting search recommendations:', error);
      return {
        success: false,
        message: 'Failed to retrieve search recommendations',
        error: error.message
      };
    }
  }

  /**
   * Delete old search logs (for data retention)
   * @param {Date} beforeDate - Delete searches before this date
   * @returns {Promise<Object>} Service response
   */
  async deleteOldSearches(beforeDate) {
    try {
      const deletedCount = await UserSearch.destroy({
        where: {
          createdAt: {
            [Op.lt]: beforeDate
          }
        }
      });

      return {
        success: true,
        message: `Deleted ${deletedCount} old search records`,
        data: { deletedCount }
      };
    } catch (error) {
      console.error('Error deleting old searches:', error);
      return {
        success: false,
        message: 'Failed to delete old search records',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export default new UserSearchService();