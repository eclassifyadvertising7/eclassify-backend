/**
 * ChatRoom Repository
 * Handles database operations for chat rooms
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { ChatRoom, Listing, User, UserProfile, ChatMessage } = models;

class ChatRoomRepository {
  /**
   * Create new chat room
   * @param {Object} roomData - Room data
   * @returns {Promise<Object>}
   */
  async create(roomData) {
    return await ChatRoom.create(roomData);
  }

  /**
   * Get room by ID with associations
   * @param {number} id - Room ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async getById(id, options = {}) {
    const include = options.includeAll ? [
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'slug', 'price', 'status', 'userId']
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
      }
    ] : [];

    return await ChatRoom.findByPk(id, { include });
  }

  /**
   * Get room by listing and buyer
   * @param {number} listingId - Listing ID
   * @param {number} buyerId - Buyer ID
   * @returns {Promise<Object|null>}
   */
  async getByListingAndBuyer(listingId, buyerId) {
    return await ChatRoom.findOne({
      where: { listingId, buyerId }
    });
  }

  /**
   * Get all rooms with filters and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}, pagination = {}) {
    const where = {};
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Filter by listing ID (for cleanup operations)
    if (filters.listingId) {
      where.listingId = filters.listingId;
    }

    // Main filter: all, buying, selling
    if (filters.main === 'buying' && filters.userId) {
      where.buyerId = filters.userId;
    } else if (filters.main === 'selling' && filters.userId) {
      where.sellerId = filters.userId;
    } else if (filters.main === 'all' && filters.userId) {
      where[Op.or] = [
        { buyerId: filters.userId },
        { sellerId: filters.userId }
      ];
    }

    // Sub filters
    if (filters.sub === 'unread' && filters.userId) {
      // Check if user is buyer or seller and apply appropriate unread count
      if (filters.main === 'buying') {
        where.unreadCountBuyer = { [Op.gt]: 0 };
      } else if (filters.main === 'selling') {
        where.unreadCountSeller = { [Op.gt]: 0 };
      } else {
        // For 'all', check both
        where[Op.or] = [
          { buyerId: filters.userId, unreadCountBuyer: { [Op.gt]: 0 } },
          { sellerId: filters.userId, unreadCountSeller: { [Op.gt]: 0 } }
        ];
      }
    } else if (filters.sub === 'important' && filters.userId) {
      if (filters.main === 'buying') {
        where.isImportantBuyer = true;
      } else if (filters.main === 'selling') {
        where.isImportantSeller = true;
      } else {
        where[Op.or] = [
          { buyerId: filters.userId, isImportantBuyer: true },
          { sellerId: filters.userId, isImportantSeller: true }
        ];
      }
    } else if (filters.sub === 'elite_buyer') {
      where.buyerSubscriptionTier = 'elite';
    } else if (filters.sub === 'elite_seller') {
      where.sellerSubscriptionTier = 'elite';
    }

    // Active filter
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Blocked filter (for panel)
    if (filters.blocked === true) {
      where[Op.or] = [
        { blockedByBuyer: true },
        { blockedBySeller: true }
      ];
    }

    // Reported filter (for panel)
    if (filters.reported === true) {
      where[Op.or] = [
        { reportedByBuyer: true },
        { reportedBySeller: true }
      ];
    }

    // Include associations
    const include = [
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'slug', 'price', 'status'],
        include: [
          {
            model: models.ListingMedia,
            as: 'media',
            where: { isPrimary: true },
            required: false,
            attributes: ['mediaUrl', 'thumbnailUrl', 'storageType', 'mimeType', 'thumbnailMimeType']
          }
        ]
      },
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
      }
    ];

    // Order by last message timestamp
    const order = [['last_message_at', 'DESC']];

    const { count, rows } = await ChatRoom.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });

    return {
      rooms: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update room
   * @param {number} id - Room ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return null;

    await room.update(updateData);
    return room;
  }

  /**
   * Update last message timestamp
   * @param {number} id - Room ID
   * @returns {Promise<boolean>}
   */
  async updateLastMessageAt(id) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    await room.update({ lastMessageAt: new Date() });
    return true;
  }

  /**
   * Increment unread count
   * @param {number} id - Room ID
   * @param {string} userType - 'buyer' or 'seller'
   * @returns {Promise<boolean>}
   */
  async incrementUnreadCount(id, userType) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    if (userType === 'buyer') {
      await room.increment('unreadCountBuyer');
    } else if (userType === 'seller') {
      await room.increment('unreadCountSeller');
    }
    return true;
  }

  /**
   * Reset unread count
   * @param {number} id - Room ID
   * @param {string} userType - 'buyer' or 'seller'
   * @returns {Promise<boolean>}
   */
  async resetUnreadCount(id, userType) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    if (userType === 'buyer') {
      await room.update({ unreadCountBuyer: 0 });
    } else if (userType === 'seller') {
      await room.update({ unreadCountSeller: 0 });
    }
    return true;
  }

  /**
   * Toggle important flag
   * @param {number} id - Room ID
   * @param {string} userType - 'buyer' or 'seller'
   * @param {boolean} isImportant - Important status
   * @returns {Promise<boolean>}
   */
  async toggleImportant(id, userType, isImportant) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    if (userType === 'buyer') {
      await room.update({ isImportantBuyer: isImportant });
    } else if (userType === 'seller') {
      await room.update({ isImportantSeller: isImportant });
    }
    return true;
  }

  /**
   * Block user
   * @param {number} id - Room ID
   * @param {string} userType - 'buyer' or 'seller'
   * @param {Object} blockData - Block metadata
   * @returns {Promise<boolean>}
   */
  async blockUser(id, userType, blockData) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    const blockMetadata = room.blockMetadata || {};
    blockMetadata[userType] = {
      reason: blockData.reason,
      blockedAt: new Date().toISOString()
    };

    if (userType === 'buyer') {
      await room.update({
        blockedByBuyer: true,
        blockMetadata
      });
    } else if (userType === 'seller') {
      await room.update({
        blockedBySeller: true,
        blockMetadata
      });
    }
    return true;
  }

  /**
   * Unblock user
   * @param {number} id - Room ID
   * @param {string} userType - 'buyer' or 'seller'
   * @returns {Promise<boolean>}
   */
  async unblockUser(id, userType) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    const blockMetadata = room.blockMetadata || {};
    delete blockMetadata[userType];

    if (userType === 'buyer') {
      await room.update({
        blockedByBuyer: false,
        blockMetadata
      });
    } else if (userType === 'seller') {
      await room.update({
        blockedBySeller: false,
        blockMetadata
      });
    }
    return true;
  }

  /**
   * Report user
   * @param {number} id - Room ID
   * @param {string} reportedBy - 'buyer' or 'seller'
   * @param {Object} reportData - Report data
   * @returns {Promise<boolean>}
   */
  async reportUser(id, reportedBy, reportData) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    const reportMetadata = room.reportMetadata || [];
    reportMetadata.push({
      reportedBy,
      reportedUser: reportData.reportedUser,
      type: reportData.type,
      reason: reportData.reason,
      reportedAt: new Date().toISOString(),
      status: 'pending'
    });

    if (reportedBy === 'buyer') {
      await room.update({
        reportedByBuyer: true,
        reportMetadata
      });
    } else if (reportedBy === 'seller') {
      await room.update({
        reportedBySeller: true,
        reportMetadata
      });
    }
    return true;
  }

  /**
   * Update contact sharing status
   * @param {number} id - Room ID
   * @param {Object} contactData - Contact sharing data
   * @returns {Promise<boolean>}
   */
  async updateContactSharing(id, contactData) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    await room.update(contactData);
    return true;
  }

  /**
   * Deactivate room
   * @param {number} id - Room ID
   * @returns {Promise<boolean>}
   */
  async deactivate(id) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    await room.update({ isActive: false });
    return true;
  }

  /**
   * Deactivate rooms by listing IDs
   * @param {Array<number>} listingIds - Array of listing IDs
   * @returns {Promise<number>} - Number of affected rows
   */
  async deactivateByListingIds(listingIds) {
    const [affectedCount] = await ChatRoom.update(
      { isActive: false },
      {
        where: {
          listingId: { [Op.in]: listingIds }
        }
      }
    );
    return affectedCount;
  }

  /**
   * Delete room
   * @param {number} id - Room ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const room = await ChatRoom.findByPk(id);
    if (!room) return false;

    await room.destroy();
    return true;
  }

  /**
   * Get statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    const [total, active, blocked, reported] = await Promise.all([
      ChatRoom.count(),
      ChatRoom.count({ where: { isActive: true } }),
      ChatRoom.count({
        where: {
          [Op.or]: [
            { blockedByBuyer: true },
            { blockedBySeller: true }
          ]
        }
      }),
      ChatRoom.count({
        where: {
          [Op.or]: [
            { reportedByBuyer: true },
            { reportedBySeller: true }
          ]
        }
      })
    ]);

    return {
      totalRooms: total,
      activeRooms: active,
      blockedRooms: blocked,
      reportedRooms: reported
    };
  }

  /**
   * Check if user is participant in room
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} - Returns { userType: 'buyer'|'seller' } or null
   */
  async getUserParticipation(roomId, userId) {
    const room = await ChatRoom.findByPk(roomId);
    if (!room) return null;

    if (room.buyerId === userId) {
      return { userType: 'buyer', room };
    } else if (room.sellerId === userId) {
      return { userType: 'seller', room };
    }
    return null;
  }
}

// Export singleton instance
export default new ChatRoomRepository();
