import models from '#models/index.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

const { UserFavorite, Listing } = models;

class UserFavoriteService {
  /**
   * Add listing to user favorites
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Service response
   */
  async addFavorite(userId, listingId) {
    try {
      // Validate input parameters with explicit checks
      if (userId === undefined || userId === null || userId === '') {
        return {
          success: false,
          message: 'User ID is required'
        };
      }
      
      if (listingId === undefined || listingId === null || listingId === '') {
        return {
          success: false,
          message: 'Listing ID is required'
        };
      }

      // Check if listing exists and get listing details
      const listing = await Listing.findByPk(listingId, {
        attributes: ['id', 'userId', 'status'],
        paranoid: true // Only active listings
      });

      if (!listing) {
        return {
          success: false,
          message: ERROR_MESSAGES.LISTING_NOT_FOUND
        };
      }

      // Check if listing is active
      if (listing.status !== 'active') {
        return {
          success: false,
          message: ERROR_MESSAGES.FAVORITE_INACTIVE_LISTING
        };
      }

      // VALIDATION CHECK 2: Listing owner shouldn't be able to favorite their own listing
      if (listing.userId === userId) {
        return {
          success: false,
          message: ERROR_MESSAGES.FAVORITE_OWN_LISTING
        };
      }

      // VALIDATION CHECK 3: Check if already favorited (including soft deleted)
      const existingFavorite = await UserFavorite.findOne({
        where: { userId, listingId },
        paranoid: false // Include soft deleted records
      });

      if (existingFavorite) {
        if (existingFavorite.deletedAt) {
          // Restore soft deleted favorite
          await existingFavorite.restore();
          return {
            success: true,
            message: SUCCESS_MESSAGES.FAVORITE_ADDED,
            data: { favoriteId: existingFavorite.id, restored: true }
          };
        } else {
          // VALIDATION CHECK 3: Prevent duplicate favorites
          return {
            success: false,
            message: ERROR_MESSAGES.FAVORITE_ALREADY_EXISTS
          };
        }
      }

      // Create new favorite
      const favorite = await UserFavorite.create({
        userId,
        listingId,
        createdAt: new Date()
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.FAVORITE_ADDED,
        data: { favoriteId: favorite.id, restored: false }
      };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAVORITE_ADD_FAILED,
        error: error.message
      };
    }
  }

  /**
   * Remove listing from user favorites
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Service response
   */
  async removeFavorite(userId, listingId) {
    try {
      // Validate input parameters
      if (!userId || !listingId) {
        return {
          success: false,
          message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS
        };
      }

      const favorite = await UserFavorite.findOne({
        where: { userId, listingId }
      });

      if (!favorite) {
        return {
          success: false,
          message: ERROR_MESSAGES.FAVORITE_NOT_FOUND
        };
      }

      // Soft delete the favorite
      await favorite.destroy();

      return {
        success: true,
        message: SUCCESS_MESSAGES.FAVORITE_REMOVED
      };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAVORITE_REMOVE_FAILED,
        error: error.message
      };
    }
  }

  /**
   * Get user's favorite listings
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Service response
   */
  async getUserFavorites(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        categoryId,
        priceMin,
        priceMax,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      
      // Build where clause for listing filters
      const listingWhere = {};
      
      if (categoryId) {
        listingWhere.categoryId = categoryId;
      }
      
      if (priceMin || priceMax) {
        listingWhere.price = {};
        if (priceMin) listingWhere.price[Op.gte] = priceMin;
        if (priceMax) listingWhere.price[Op.lte] = priceMax;
      }

      // Map sortBy to correct column name (snake_case for database)
      const sortColumn = sortBy === 'created_at' ? 'created_at' : sortBy;

      const { count, rows } = await UserFavorite.findAndCountAll({
        where: { userId },
        limit,
        offset,
        order: [[sortColumn, sortOrder]],
        include: [
          {
            association: 'listing',
            where: listingWhere,
            attributes: ['id', 'title', 'price', 'status', 'categoryId', ['created_at', 'createdAt']],
            required: true
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        message: SUCCESS_MESSAGES.FAVORITES_RETRIEVED,
        data: {
          favorites: rows,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit
          }
        }
      };
    } catch (error) {
      console.error('Error getting user favorites:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAVORITES_FETCH_FAILED,
        error: error.message
      };
    }
  }

  /**
   * Check if listing is favorited by user
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Service response
   */
  async isFavorited(userId, listingId) {
    try {
      const favorite = await UserFavorite.findOne({
        where: { userId, listingId }
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.FAVORITE_STATUS_CHECKED,
        data: { isFavorited: !!favorite }
      };
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAVORITE_STATUS_FAILED,
        error: error.message
      };
    }
  }

  /**
   * Get favorite statistics for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Service response
   */
  async getFavoriteStats(userId) {
    try {
      const totalFavorites = await UserFavorite.count({
        where: { userId }
      });

      const favoritesByCategory = await UserFavorite.findAll({
        where: { userId },
        attributes: [
          [sequelize.col('listing.category_id'), 'categoryId'],
          [sequelize.fn('COUNT', sequelize.col('UserFavorite.id')), 'count']
        ],
        include: [
          {
            association: 'listing',
            attributes: [],
            include: [
              {
                association: 'category',
                attributes: ['name']
              }
            ]
          }
        ],
        group: ['listing.category_id', 'listing->category.id', 'listing->category.name'],
        order: [[sequelize.literal('count'), 'DESC']]
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.FAVORITE_STATS_RETRIEVED,
        data: {
          totalFavorites,
          favoritesByCategory
        }
      };
    } catch (error) {
      console.error('Error getting favorite stats:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAVORITE_STATS_FAILED,
        error: error.message
      };
    }
  }

  /**
   * Get favorite count for a specific listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Service response
   */
  async getListingFavoriteCount(listingId) {
    try {
      const favoriteCount = await UserFavorite.count({
        where: { listingId }
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.FAVORITE_COUNT_RETRIEVED,
        data: {
          listingId,
          favoriteCount
        }
      };
    } catch (error) {
      console.error('Error getting listing favorite count:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAVORITE_STATS_FAILED,
        error: error.message
      };
    }
  }


}

// Export singleton instance
export default new UserFavoriteService();