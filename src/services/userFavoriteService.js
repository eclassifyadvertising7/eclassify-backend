import UserFavorite from '#models/UserFavorite.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';

class UserFavoriteService {
  /**
   * Add listing to user favorites
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Service response
   */
  async addFavorite(userId, listingId) {
    try {
      // Check if already favorited (including soft deleted)
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
            message: 'Listing added to favorites',
            data: { favoriteId: existingFavorite.id, restored: true }
          };
        } else {
          return {
            success: false,
            message: 'Listing is already in favorites'
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
        message: 'Listing added to favorites',
        data: { favoriteId: favorite.id, restored: false }
      };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return {
        success: false,
        message: 'Failed to add listing to favorites',
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
      const favorite = await UserFavorite.findOne({
        where: { userId, listingId }
      });

      if (!favorite) {
        return {
          success: false,
          message: 'Listing not found in favorites'
        };
      }

      // Soft delete the favorite
      await favorite.destroy();

      return {
        success: true,
        message: 'Listing removed from favorites'
      };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return {
        success: false,
        message: 'Failed to remove listing from favorites',
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

      const { count, rows } = await UserFavorite.findAndCountAll({
        where: { userId },
        limit,
        offset,
        order: [[sortBy === 'price' ? { model: 'Listing', as: 'listing' } : sortBy, sortOrder]],
        include: [
          {
            association: 'listing',
            where: listingWhere,
            attributes: ['id', 'title', 'price', 'status', 'categoryId', 'createdAt'],
            required: true
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        message: 'Favorites retrieved successfully',
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
        message: 'Failed to retrieve favorites',
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
        data: { isFavorited: !!favorite }
      };
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return {
        success: false,
        message: 'Failed to check favorite status',
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
        message: 'Favorite statistics retrieved successfully',
        data: {
          totalFavorites,
          favoritesByCategory
        }
      };
    } catch (error) {
      console.error('Error getting favorite stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve favorite statistics',
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
        message: 'Listing favorite count retrieved successfully',
        data: {
          listingId,
          favoriteCount
        }
      };
    } catch (error) {
      console.error('Error getting listing favorite count:', error);
      return {
        success: false,
        message: 'Failed to retrieve listing favorite count',
        error: error.message
      };
    }
  }


}

// Export singleton instance
export default new UserFavoriteService();