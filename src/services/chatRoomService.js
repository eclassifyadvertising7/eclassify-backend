/**
 * ChatRoom Service
 * Business logic for chat room management
 */

import chatRoomRepository from '#repositories/chatRoomRepository.js';
import listingRepository from '#repositories/listingRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class ChatRoomService {
  /**
   * Create or get existing chat room
   * @param {number} listingId - Listing ID
   * @param {number} buyerId - Buyer user ID
   * @returns {Promise<Object>}
   */
  async createOrGet(listingId, buyerId) {
    // Validate listing exists and is active
    const listing = await listingRepository.getById(listingId);
    
    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.status !== 'active') {
      throw new Error('Cannot chat about inactive listings');
    }

    // Check if user is trying to chat with themselves
    if (listing.userId === buyerId) {
      throw new Error('Cannot chat with yourself');
    }

    // Check if room already exists
    const existingRoom = await chatRoomRepository.getByListingAndBuyer(listingId, buyerId);
    
    if (existingRoom) {
      return {
        success: true,
        message: 'Chat room retrieved successfully',
        data: {
          roomId: existingRoom.id,
          isNew: false
        }
      };
    }

    // Create new room
    const room = await chatRoomRepository.create({
      listingId,
      buyerId,
      sellerId: listing.userId,
      buyerSubscriptionTier: null,
      sellerSubscriptionTier: null,
      isActive: true
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHAT_ROOM_CREATED,
      data: {
        roomId: room.id,
        isNew: true
      }
    };
  }

  /**
   * Get user's chat rooms with filters
   * @param {number} userId - User ID
   * @param {Object} filters - Filter options (main, sub)
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getRooms(userId, filters = {}, pagination = {}) {
    const result = await chatRoomRepository.getAll(
      { ...filters, userId },
      pagination
    );

    return {
      success: true,
      message: 'Chat rooms retrieved successfully',
      data: result.rooms,
      pagination: result.pagination
    };
  }

  /**
   * Get room details
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID (for access check)
   * @param {boolean} isSuperAdmin - Whether user is super_admin
   * @returns {Promise<Object>}
   */
  async getRoomDetails(roomId, userId, isSuperAdmin = false) {
    // Super admin can view any room
    if (!isSuperAdmin) {
      const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
      
      if (!participation) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      }
    }

    const room = await chatRoomRepository.getById(roomId, { includeAll: true });

    if (!room) {
      throw new Error(ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND);
    }

    return {
      success: true,
      message: 'Chat room retrieved successfully',
      data: room
    };
  }

  /**
   * Toggle important flag
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID
   * @param {boolean} isImportant - Important status
   * @param {boolean} isSuperAdmin - Whether user is super_admin
   * @returns {Promise<Object>}
   */
  async toggleImportant(roomId, userId, isImportant, isSuperAdmin = false) {
    // Super admin cannot toggle important (spectator mode only)
    if (isSuperAdmin) {
      throw new Error('Super admin cannot modify room settings');
    }

    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    const success = await chatRoomRepository.toggleImportant(
      roomId,
      participation.userType,
      isImportant
    );

    if (!success) {
      throw new Error('Failed to update important status');
    }

    return {
      success: true,
      message: isImportant ? 'Room marked as important' : 'Room unmarked as important',
      data: null
    };
  }

  /**
   * Block user
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID who is blocking
   * @param {boolean} blocked - Block status
   * @param {string} reason - Block reason
   * @param {boolean} isSuperAdmin - Whether user is super_admin
   * @returns {Promise<Object>}
   */
  async blockUser(roomId, userId, blocked, reason = null, isSuperAdmin = false) {
    // Super admin cannot block users (spectator mode only)
    if (isSuperAdmin) {
      throw new Error('Super admin cannot block users in spectator mode');
    }

    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (blocked && !reason) {
      throw new Error('Block reason is required');
    }

    let success;
    if (blocked) {
      success = await chatRoomRepository.blockUser(
        roomId,
        participation.userType,
        { reason }
      );
    } else {
      success = await chatRoomRepository.unblockUser(
        roomId,
        participation.userType
      );
    }

    if (!success) {
      throw new Error('Failed to update block status');
    }

    return {
      success: true,
      message: blocked ? 'User blocked successfully' : 'User unblocked successfully',
      data: null
    };
  }

  /**
   * Report user/room
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID who is reporting
   * @param {string} reportType - Report type (spam, harassment, etc.)
   * @param {string} reason - Report reason
   * @param {boolean} isSuperAdmin - Whether user is super_admin
   * @returns {Promise<Object>}
   */
  async reportUser(roomId, userId, reportType, reason, isSuperAdmin = false) {
    // Super admin cannot report (spectator mode only)
    if (isSuperAdmin) {
      throw new Error('Super admin cannot report users in spectator mode');
    }

    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!reportType || !reason) {
      throw new Error('Report type and reason are required');
    }

    if (reason.length < 10) {
      throw new Error('Report reason must be at least 10 characters');
    }

    // Determine who is being reported
    const reportedUserId = participation.userType === 'buyer' 
      ? participation.room.sellerId 
      : participation.room.buyerId;

    const success = await chatRoomRepository.reportUser(
      roomId,
      participation.userType,
      {
        reportedUser: reportedUserId,
        type: reportType,
        reason
      }
    );

    if (!success) {
      throw new Error('Failed to submit report');
    }

    return {
      success: true,
      message: 'Report submitted successfully',
      data: null
    };
  }

  /**
   * Request contact information (buyer)
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID (must be buyer)
   * @returns {Promise<Object>}
   */
  async requestContact(roomId, userId) {
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (participation.userType !== 'buyer') {
      throw new Error('Only buyers can request contact information');
    }

    if (participation.room.buyerRequestedContact) {
      throw new Error('Contact already requested');
    }

    const success = await chatRoomRepository.updateContactSharing(roomId, {
      buyerRequestedContact: true
    });

    if (!success) {
      throw new Error('Failed to request contact');
    }

    return {
      success: true,
      message: 'Contact request sent',
      data: null
    };
  }

  /**
   * Share contact information (seller)
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID (must be seller)
   * @param {Object} contactData - Contact information
   * @returns {Promise<Object>}
   */
  async shareContact(roomId, userId, contactData) {
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (participation.userType !== 'seller') {
      throw new Error('Only sellers can share contact information');
    }

    if (participation.room.sellerSharedContact) {
      throw new Error('Contact already shared');
    }

    if (!contactData.phone && !contactData.email) {
      throw new Error('At least phone or email is required');
    }

    const success = await chatRoomRepository.updateContactSharing(roomId, {
      sellerSharedContact: true
    });

    if (!success) {
      throw new Error('Failed to share contact');
    }

    return {
      success: true,
      message: 'Contact information shared',
      data: contactData
    };
  }

  /**
   * Delete chat room
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID
   * @param {boolean} isSuperAdmin - Whether user is super_admin
   * @returns {Promise<Object>}
   */
  async deleteRoom(roomId, userId, isSuperAdmin = false) {
    // Super admin can delete any room (for moderation)
    if (!isSuperAdmin) {
      const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
      
      if (!participation) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      }
    }

    const success = await chatRoomRepository.delete(roomId);

    if (!success) {
      throw new Error('Failed to delete room');
    }

    return {
      success: true,
      message: 'Chat room deleted successfully',
      data: null
    };
  }

  /**
   * Get chat statistics (admin)
   * @returns {Promise<Object>}
   */
  async getStats() {
    const stats = await chatRoomRepository.getStats();

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };
  }

  /**
   * Validate user access to room
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - { userType: 'buyer'|'seller', room }
   */
  async validateAccess(roomId, userId) {
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return participation;
  }
}

// Export singleton instance
export default new ChatRoomService();
