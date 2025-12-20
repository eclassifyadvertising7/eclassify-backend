import UserFavorite from '#models/UserFavorite.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';

class UserFavoriteRepository {
  /**
   * Create a new favorite
   * @param {Object} favoriteData - Favorite data
   * @returns {Promise<Object>} Created favorite
   */
  async create(favoriteData) {
    return await UserFavorite.create(favoriteData);
  }

  /**
   * Find favorite by user and listing
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @param {boolean} includeSoftDeleted - Include soft deleted records
   * @returns {Promise<Object|null>} Favorite record
   */
  async findByUserAndListing(userId, listingId, includeSoftDeleted = false) {
    return await UserFavorite.findOne({
      where: { userId, listingId },
      paranoid: !includeSoftDeleted
    });
  }

  /**
   * Get user favorites with pagination and filters
   * @param {number} userId - User ID
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Favorites with pagination
   */
  async getUserFavorites(userId, filters = {}, options = {}) {
    const {
      categoryId,
      priceMin,
      priceMax,
      status = 'active'
    } = filters;

    const {
      limit = 20,
      offset = 0,
      order = [['created_at', 'DESC']]
    } = options;

    // Build listing where clause
    const listingWhere = { status };
    
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
      order,
      include: [
        {
          association: 'listing',
          where: listingWhere,
          attributes: ['id', 'title', 'price', 'status', 'categoryId', ['created_at', 'createdAt']],
          required: true,
          include: [
            {
              association: 'category',
              attributes: ['id', 'name']
            },
            {
              association: 'media',
              attributes: ['id', 'mediaUrl', 'mediaType'],
              limit: 1,
              order: [['created_at', 'ASC']]
            }
          ]
        }
      ]
    });

    return {
      favorites: rows,
      total: count,
      limit,
      offset
    };
  }

  /**
   * Get favorite count by user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Favorite count
   */
  async getFavoriteCount(userId) {
    return await UserFavorite.count({
      where: { userId }
    });
  }

  /**
   * Get favorites by category for user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Favorites grouped by category
   */
  async getFavoritesByCategory(userId) {
    return await UserFavorite.findAll({
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
  }

  /**
   * Get most favorited listings
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Most favorited listings
   */
  async getMostFavoritedListings(options = {}) {
    const {
      limit = 10,
      categoryId,
      startDate,
      endDate
    } = options;

    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const listingWhere = {};
    if (categoryId) {
      listingWhere.categoryId = categoryId;
    }

    return await UserFavorite.findAll({
      where: whereClause,
      attributes: [
        'listingId',
        [sequelize.fn('COUNT', sequelize.col('UserFavorite.id')), 'favoriteCount']
      ],
      include: [
        {
          association: 'listing',
          where: listingWhere,
          attributes: ['id', 'title', 'price', 'status'],
          required: true
        }
      ],
      group: ['listingId', 'listing.id'],
      order: [[sequelize.literal('favoriteCount'), 'DESC']],
      limit
    });
  }

  /**
   * Soft delete favorite
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<boolean>} Success status
   */
  async softDelete(userId, listingId) {
    const favorite = await UserFavorite.findOne({
      where: { userId, listingId }
    });

    if (favorite) {
      await favorite.destroy();
      return true;
    }
    return false;
  }

  /**
   * Restore soft deleted favorite
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<boolean>} Success status
   */
  async restore(userId, listingId) {
    const favorite = await UserFavorite.findOne({
      where: { userId, listingId },
      paranoid: false
    });

    if (favorite && favorite.deletedAt) {
      await favorite.restore();
      return true;
    }
    return false;
  }

  /**
   * Check if listing is favorited by user
   * @param {number} userId - User ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<boolean>} Is favorited
   */
  async isFavorited(userId, listingId) {
    const favorite = await UserFavorite.findOne({
      where: { userId, listingId }
    });
    return !!favorite;
  }

  /**
   * Get favorite statistics for analytics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Favorite statistics
   */
  async getFavoriteStats(filters = {}) {
    const { startDate, endDate } = filters;
    
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalFavorites = await UserFavorite.count({ where: whereClause });
    
    const uniqueUsers = await UserFavorite.count({
      where: whereClause,
      distinct: true,
      col: 'userId'
    });

    const uniqueListings = await UserFavorite.count({
      where: whereClause,
      distinct: true,
      col: 'listingId'
    });

    return {
      totalFavorites,
      uniqueUsers,
      uniqueListings,
      avgFavoritesPerUser: uniqueUsers > 0 ? (totalFavorites / uniqueUsers).toFixed(2) : 0
    };
  }

  /**
   * Get favorite count for a specific listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<number>} Favorite count
   */
  async getListingFavoriteCount(listingId) {
    return await UserFavorite.count({
      where: { listingId }
    });
  }


}

// Export singleton instance
export default new UserFavoriteRepository();