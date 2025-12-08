/**
 * ChatMedia Service
 * Handles cleanup of chat media files
 */

import chatRoomRepository from '#repositories/chatRoomRepository.js';
import chatMessageRepository from '#repositories/chatMessageRepository.js';
import { deleteFile } from '#config/storageConfig.js';

class ChatMediaService {
  /**
   * Delete all chat media files for a listing
   * Called before listing deletion to clean up physical files
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>}
   */
  async deleteAllByListingId(listingId) {
    try {
      // Get all chat rooms for this listing
      const { rooms } = await chatRoomRepository.getAll(
        { listingId },
        { page: 1, limit: 1000 }
      );

      let deletedCount = 0;
      let failedCount = 0;

      for (const room of rooms) {
        // Get all messages with media (images only)
        const { messages } = await chatMessageRepository.getByRoomId(
          room.id,
          { page: 1, limit: 10000 }
        );

        // Filter messages that have media
        const mediaMessages = messages.filter(
          msg => msg.messageType === 'image' && msg.mediaUrl
        );

        // Delete physical files
        for (const message of mediaMessages) {
          try {
            // Delete main media file
            if (message.mediaUrl) {
              await deleteFile(message.mediaUrl, message.storageType, {
                resourceType: 'image',
                mimeType: message.mimeType
              });
            }

            // Delete thumbnail if different from main media
            if (message.thumbnailUrl && message.thumbnailUrl !== message.mediaUrl) {
              await deleteFile(message.thumbnailUrl, message.storageType, {
                resourceType: 'image',
                mimeType: message.thumbnailMimeType
              });
            }

            deletedCount++;
          } catch (error) {
            console.error(`Failed to delete chat media: ${error.message}`);
            failedCount++;
          }
        }
      }

      return {
        success: true,
        deletedCount,
        failedCount,
        roomsProcessed: rooms.length
      };
    } catch (error) {
      console.error(`Error deleting chat media for listing ${listingId}:`, error);
      throw error;
    }
  }

  /**
   * Delete media for a specific chat room
   * @param {number} roomId - Chat room ID
   * @returns {Promise<Object>}
   */
  async deleteAllByRoomId(roomId) {
    try {
      // Get all messages with media
      const { messages } = await chatMessageRepository.getByRoomId(
        roomId,
        { page: 1, limit: 10000 }
      );

      // Filter messages that have media
      const mediaMessages = messages.filter(
        msg => msg.messageType === 'image' && msg.mediaUrl
      );

      let deletedCount = 0;
      let failedCount = 0;

      // Delete physical files
      for (const message of mediaMessages) {
        try {
          // Delete main media file
          if (message.mediaUrl) {
            await deleteFile(message.mediaUrl, message.storageType, {
              resourceType: 'image',
              mimeType: message.mimeType
            });
          }

          // Delete thumbnail if different from main media
          if (message.thumbnailUrl && message.thumbnailUrl !== message.mediaUrl) {
            await deleteFile(message.thumbnailUrl, message.storageType, {
              resourceType: 'image',
              mimeType: message.thumbnailMimeType
            });
          }

          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete chat media: ${error.message}`);
          failedCount++;
        }
      }

      return {
        success: true,
        deletedCount,
        failedCount
      };
    } catch (error) {
      console.error(`Error deleting chat media for room ${roomId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export default new ChatMediaService();
