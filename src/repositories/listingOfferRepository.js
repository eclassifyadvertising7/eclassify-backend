/**
 * ListingOffer Repository
 * Handles database operations for listing offers
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { ListingOffer, Listing, User, ChatRoom } = models;

class ListingOfferRepository {
  /**
   * Create new offer
   * @param {Object} offerData - Offer data
   * @returns {Promise<Object>}
   */
  async create(offerData) {
    return await ListingOffer.create(offerData);
  }

  /**
   * Get offer by ID
   * @param {number} id - Offer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async getById(id, options = {}) {
    const include = options.includeAll ? [
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'price', 'status']
      },
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'fullName', 'email', 'mobile'],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      },
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'fullName', 'email', 'mobile'],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      },
      {
        model: ListingOffer,
        as: 'parentOffer',
        attributes: ['id', 'offeredAmount', 'status']
      }
    ] : [];

    return await ListingOffer.findByPk(id, { include });
  }

  /**
   * Get offers by room ID
   * @param {number} chatRoomId - Chat room ID
   * @returns {Promise<Array>}
   */
  async getByRoomId(chatRoomId) {
    return await ListingOffer.findAll({
      where: { chatRoomId },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'fullName'],
          include: [
            {
              model: UserProfile,
              as: 'profile',
              attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
            }
          ]
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'fullName'],
          include: [
            {
              model: UserProfile,
              as: 'profile',
              attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
            }
          ]
        },
        {
          model: ListingOffer,
          as: 'parentOffer',
          attributes: ['id', 'offeredAmount', 'status']
        }
      ],
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Get offers by listing ID
   * @param {number} listingId - Listing ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getByListingId(listingId, filters = {}) {
    const where = { listingId };

    if (filters.status) {
      where.status = filters.status;
    }

    return await ListingOffer.findAll({
      where,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'fullName']
        },
        {
          model: ChatRoom,
          as: 'chatRoom',
          attributes: ['id']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get offers by buyer ID
   * @param {number} buyerId - Buyer ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getByBuyerId(buyerId, filters = {}) {
    const where = { buyerId };

    if (filters.status) {
      where.status = filters.status;
    }

    return await ListingOffer.findAll({
      where,
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get offers by seller ID
   * @param {number} sellerId - Seller ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getBySellerId(sellerId, filters = {}) {
    const where = { sellerId };

    if (filters.status) {
      where.status = filters.status;
    }

    return await ListingOffer.findAll({
      where,
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'fullName']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get pending offers count for buyer on listing
   * @param {number} buyerId - Buyer ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<number>}
   */
  async getPendingCountByBuyerAndListing(buyerId, listingId) {
    return await ListingOffer.count({
      where: {
        buyerId,
        listingId,
        status: 'pending'
      }
    });
  }

  /**
   * Update offer
   * @param {number} id - Offer ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    const offer = await ListingOffer.findByPk(id);
    if (!offer) return null;

    await offer.update(updateData);
    return offer;
  }

  /**
   * Update offer status
   * @param {number} id - Offer ID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data (rejection reason, etc.)
   * @returns {Promise<Object|null>}
   */
  async updateStatus(id, status, additionalData = {}) {
    const updateData = {
      status,
      respondedAt: new Date(),
      ...additionalData
    };

    return await this.update(id, updateData);
  }

  /**
   * Mark offer as viewed
   * @param {number} id - Offer ID
   * @returns {Promise<boolean>}
   */
  async markAsViewed(id) {
    const offer = await ListingOffer.findByPk(id);
    if (!offer) return false;

    if (!offer.viewedAt) {
      await offer.update({ viewedAt: new Date() });
    }
    return true;
  }

  /**
   * Expire pending offers
   * @returns {Promise<Array>} - Array of expired offer IDs
   */
  async expirePendingOffers() {
    const expiredOffers = await ListingOffer.findAll({
      where: {
        status: 'pending',
        expiresAt: { [Op.lt]: new Date() }
      },
      attributes: ['id', 'chatRoomId', 'offeredAmount']
    });

    if (expiredOffers.length > 0) {
      const offerIds = expiredOffers.map(o => o.id);
      
      await ListingOffer.update(
        {
          status: 'expired',
          autoRejected: true,
          respondedAt: new Date()
        },
        {
          where: {
            id: { [Op.in]: offerIds }
          }
        }
      );
    }

    return expiredOffers;
  }

  /**
   * Get counter offers (children of parent offer)
   * @param {number} parentOfferId - Parent offer ID
   * @returns {Promise<Array>}
   */
  async getCounterOffers(parentOfferId) {
    return await ListingOffer.findAll({
      where: { parentOfferId },
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Get negotiation chain (parent and all children)
   * @param {number} offerId - Any offer ID in the chain
   * @returns {Promise<Array>}
   */
  async getNegotiationChain(offerId) {
    const offer = await ListingOffer.findByPk(offerId);
    if (!offer) return [];

    // Find root offer
    let rootOfferId = offerId;
    if (offer.parentOfferId) {
      const rootOffer = await ListingOffer.findOne({
        where: {
          id: offer.parentOfferId,
          parentOfferId: null
        }
      });
      if (rootOffer) {
        rootOfferId = rootOffer.id;
      }
    }

    // Get all offers in chain
    return await ListingOffer.findAll({
      where: {
        [Op.or]: [
          { id: rootOfferId },
          { parentOfferId: rootOfferId }
        ]
      },
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Delete offer
   * @param {number} id - Offer ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const offer = await ListingOffer.findByPk(id);
    if (!offer) return false;

    await offer.destroy();
    return true;
  }

  /**
   * Get offer statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getStats(filters = {}) {
    const where = {};

    if (filters.listingId) {
      where.listingId = filters.listingId;
    }

    const [total, pending, accepted, rejected, withdrawn, expired, countered] = await Promise.all([
      ListingOffer.count({ where }),
      ListingOffer.count({ where: { ...where, status: 'pending' } }),
      ListingOffer.count({ where: { ...where, status: 'accepted' } }),
      ListingOffer.count({ where: { ...where, status: 'rejected' } }),
      ListingOffer.count({ where: { ...where, status: 'withdrawn' } }),
      ListingOffer.count({ where: { ...where, status: 'expired' } }),
      ListingOffer.count({ where: { ...where, status: 'countered' } })
    ]);

    const acceptanceRate = total > 0 ? ((accepted / total) * 100).toFixed(2) : 0;

    return {
      totalOffers: total,
      pending,
      accepted,
      rejected,
      withdrawn,
      expired,
      countered,
      acceptanceRate: parseFloat(acceptanceRate)
    };
  }

  /**
   * Get top listings by offer count
   * @param {number} limit - Number of listings to return
   * @returns {Promise<Array>}
   */
  async getTopListingsByOfferCount(limit = 10) {
    const results = await ListingOffer.findAll({
      attributes: [
        'listingId',
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'offerCount'],
        [models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN status = 'accepted' THEN 1 END")), 'acceptedCount']
      ],
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price']
        }
      ],
      group: ['listingId', 'listing.id'],
      order: [[models.sequelize.literal('offerCount'), 'DESC']],
      limit,
      raw: false
    });

    return results;
  }

  /**
   * Get offer trends (daily/weekly)
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>}
   */
  async getOfferTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await ListingOffer.findAll({
      attributes: [
        [models.sequelize.fn('DATE', models.sequelize.col('created_at')), 'date'],
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      group: [models.sequelize.fn('DATE', models.sequelize.col('created_at'))],
      order: [[models.sequelize.fn('DATE', models.sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    return results;
  }
}

// Export singleton instance
export default new ListingOfferRepository();
