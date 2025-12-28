/**
 * ChatMessage Service
 * Business logic for chat message management
 */

import chatMessageRepository from '#repositories/chatMessageRepository.js';
import chatRoomRepository from '#repositories/chatRoomRepository.js';
import { uploadFile, deleteFile } from '#config/storageConfig.js';
import imageService from '#services/imageService.js';
import { getRelativePath } from '#utils/storageHelper.js';
import { UPLOAD_CONFIG } from '#config/uploadConfig.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import sharp from 'sharp';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

class ChatMessageService {
  _getRecipientId(participation) {
    const recipientType = participation.userType === 'buyer' ? 'seller' : 'buyer';
    return recipientType === 'buyer' ? participation.room.buyerId : participation.room.sellerId;
  }

  /**
   * Validate room is active and user is not blocked
   * @param {Object} room - Room object
   * @param {string} userType - 'buyer' or 'seller'
   * @private
   */
  _validateRoomStatus(room, userType) {
    if (!room.isActive) {
      throw new Error('Cannot send messages. Listing is no longer available.');
    }

    // Check if blocked
    if (userType === 'buyer' && room.blockedBySeller) {
      throw new Error('Cannot send messages. User has blocked you.');
    }
    if (userType === 'seller' && room.blockedByBuyer) {
      throw new Error('Cannot send messages. User has blocked you.');
    }
  }

  /**
   * Send text message
   * @param {number} roomId - Room ID
   * @param {number} userId - Sender user ID
   * @param {string} messageText - Message text
   * @param {number} replyToMessageId - Reply to message ID (optional)
   * @returns {Promise<Object>}
   */
  async sendTextMessage(roomId, userId, messageText, replyToMessageId = null) {
    // Validate access
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Validate room status
    this._validateRoomStatus(participation.room, participation.userType);

    // Validate message text
    if (!messageText || messageText.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }

    if (messageText.length > 5000) {
      throw new Error('Message text cannot exceed 5000 characters');
    }

    // Create message
    const message = await chatMessageRepository.create({
      chatRoomId: roomId,
      senderId: userId,
      messageText: messageText.trim(),
      messageType: 'text',
      replyToMessageId
    });

    // Update room last message timestamp
    await chatRoomRepository.updateLastMessageAt(roomId);

    // Increment unread count for recipient
    const recipientType = participation.userType === 'buyer' ? 'seller' : 'buyer';
    await chatRoomRepository.incrementUnreadCount(roomId, recipientType);

    const recipientId = this._getRecipientId(participation);

    return {
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_SENT,
      data: {
        messageId: message.id,
        createdAt: message.createdAt,
        recipientId
      }
    };
  }

  /**
   * Send image message
   * @param {number} roomId - Room ID
   * @param {number} userId - Sender user ID
   * @param {Object} file - Uploaded file
   * @param {string} messageText - Optional caption
   * @returns {Promise<Object>}
   */
  async sendImageMessage(roomId, userId, file, messageText = null) {
    // Validate access
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Validate room status
    this._validateRoomStatus(participation.room, participation.userType);

    if (!file) {
      throw new Error('Image file is required');
    }

    try {
      let mediaUrl, thumbnailUrl, width, height;

      if (STORAGE_TYPE === 'cloudinary') {
        // Optimize image before upload
        const optimizedBuffer = await this._optimizeImage(file, UPLOAD_CONFIG.CHAT_IMAGE);
        const thumbnailBuffer = await this._createThumbnail(file, UPLOAD_CONFIG.CHAT_IMAGE.thumbnailSize);

        // Upload main image to Cloudinary
        const folder = `uploads/chats/room-${roomId}/images`;
        const uploadResult = await uploadFile(
          { ...file, buffer: optimizedBuffer },
          folder,
          { resourceType: 'image' }
        );

        // Upload thumbnail
        const thumbnailResult = await uploadFile(
          { ...file, buffer: thumbnailBuffer, originalname: `thumb_${file.originalname}` },
          folder,
          { resourceType: 'image' }
        );

        mediaUrl = uploadResult.publicId;
        thumbnailUrl = thumbnailResult.publicId;
        width = uploadResult.width;
        height = uploadResult.height;
      } else {
        // Local storage - file already saved by multer
        const relativePath = getRelativePath(file.path);
        
        // Process image
        await imageService.processImage(file.path, UPLOAD_CONFIG.CHAT_IMAGE);
        
        // Create thumbnail
        const thumbnailPath = file.path.replace(/(\.[\w\d_-]+)$/i, '_thumb$1');
        await sharp(file.path)
          .resize(UPLOAD_CONFIG.CHAT_IMAGE.thumbnailSize, UPLOAD_CONFIG.CHAT_IMAGE.thumbnailSize, {
            fit: 'cover'
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);

        mediaUrl = relativePath;
        thumbnailUrl = getRelativePath(thumbnailPath);

        // Get dimensions
        const metadata = await sharp(file.path).metadata();
        width = metadata.width;
        height = metadata.height;
      }

      // Create message
      const message = await chatMessageRepository.create({
        chatRoomId: roomId,
        senderId: userId,
        messageText: messageText?.trim() || null,
        messageType: 'image',
        mediaUrl,
        thumbnailUrl,
        mimeType: file.mimetype,
        thumbnailMimeType: 'image/jpeg',
        fileSizeBytes: file.size,
        width,
        height,
        storageType: STORAGE_TYPE
      });

      // Update room last message timestamp
      await chatRoomRepository.updateLastMessageAt(roomId);

      // Increment unread count for recipient
      const recipientType = participation.userType === 'buyer' ? 'seller' : 'buyer';
      await chatRoomRepository.incrementUnreadCount(roomId, recipientType);

      const recipientId = this._getRecipientId(participation);

      return {
        success: true,
        message: SUCCESS_MESSAGES.MESSAGE_SENT,
        data: {
          messageId: message.id,
          createdAt: message.createdAt,
          recipientId
        }
      };
    } catch (error) {
      // Clean up uploaded file on error
      if (STORAGE_TYPE === 'local' && file.path) {
        await imageService.deleteImage(getRelativePath(file.path));
      }
      throw error;
    }
  }

  /**
   * Optimize image using Sharp
   * @param {Object} file - Multer file object
   * @param {Object} config - Upload config
   * @returns {Promise<Buffer>}
   * @private
   */
  async _optimizeImage(file, config) {
    try {
      const imageBuffer = file.buffer || (await sharp(file.path).toBuffer());
      
      return await sharp(imageBuffer)
        .resize(config.maxWidth, config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: config.quality })
        .toBuffer();
    } catch (error) {
      console.error('Image optimization error:', error);
      return file.buffer || imageBuffer;
    }
  }

  /**
   * Create thumbnail
   * @param {Object} file - Multer file object
   * @param {number} size - Thumbnail size
   * @returns {Promise<Buffer>}
   * @private
   */
  async _createThumbnail(file, size) {
    const imageBuffer = file.buffer || (await sharp(file.path).toBuffer());
    
    return await sharp(imageBuffer)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  /**
   * Send location message
   * @param {number} roomId - Room ID
   * @param {number} userId - Sender user ID
   * @param {Object} locationData - Location data (lat, lng, address)
   * @param {string} messageText - Optional message text
   * @returns {Promise<Object>}
   */
  async sendLocationMessage(roomId, userId, locationData, messageText = null) {
    // Validate access
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Validate room status
    this._validateRoomStatus(participation.room, participation.userType);

    // Validate location data
    if (!locationData.lat || !locationData.lng) {
      throw new Error('Latitude and longitude are required');
    }

    // Create message
    const message = await chatMessageRepository.create({
      chatRoomId: roomId,
      senderId: userId,
      messageText: messageText?.trim() || null,
      messageType: 'location',
      messageMetadata: {
        lat: locationData.lat,
        lng: locationData.lng,
        address: locationData.address || null
      }
    });

    // Update room last message timestamp
    await chatRoomRepository.updateLastMessageAt(roomId);

    // Increment unread count for recipient
    const recipientType = participation.userType === 'buyer' ? 'seller' : 'buyer';
    await chatRoomRepository.incrementUnreadCount(roomId, recipientType);

    const recipientId = this._getRecipientId(participation);

    return {
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_SENT,
      data: {
        messageId: message.id,
        createdAt: message.createdAt,
        recipientId
      }
    };
  }

  /**
   * Send system message
   * @param {number} roomId - Room ID
   * @param {string} systemEventType - Event type
   * @param {string} messageText - Message text
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>}
   */
  async sendSystemMessage(roomId, systemEventType, messageText, metadata = {}) {
    const message = await chatMessageRepository.create({
      chatRoomId: roomId,
      senderId: null,
      messageText,
      messageType: 'system',
      systemEventType,
      messageMetadata: metadata
    });

    // Update room last message timestamp
    await chatRoomRepository.updateLastMessageAt(roomId);

    return {
      success: true,
      message: 'System message sent',
      data: {
        messageId: message.id,
        createdAt: message.createdAt
      }
    };
  }

  /**
   * Get messages for room
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID (for access check)
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getMessages(roomId, userId, pagination = {}) {
    // Validate access
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    const result = await chatMessageRepository.getByRoomId(roomId, pagination);

    return {
      success: true,
      message: 'Messages retrieved successfully',
      data: result.messages,
      pagination: result.pagination
    };
  }

  /**
   * Edit message
   * @param {number} messageId - Message ID
   * @param {number} userId - User ID
   * @param {string} newText - New message text
   * @returns {Promise<Object>}
   */
  async editMessage(messageId, userId, newText) {
    if (!newText || newText.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }

    if (newText.length > 5000) {
      throw new Error('Message text cannot exceed 5000 characters');
    }

    // Check if message can be edited
    const canEditResult = await chatMessageRepository.canEdit(messageId, userId);
    
    if (!canEditResult.canEdit) {
      throw new Error(canEditResult.reason);
    }

    // Update message
    await chatMessageRepository.update(messageId, {
      messageText: newText.trim(),
      editedAt: new Date()
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_UPDATED,
      data: null
    };
  }

  /**
   * Delete message (soft delete)
   * @param {number} messageId - Message ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async deleteMessage(messageId, userId) {
    const message = await chatMessageRepository.getById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    const success = await chatMessageRepository.delete(messageId);

    if (!success) {
      throw new Error('Failed to delete message');
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_DELETED,
      data: null
    };
  }

  /**
   * Mark messages as read
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async markAsRead(roomId, userId) {
    // Validate access
    const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
    if (!participation) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Mark messages as read
    await chatMessageRepository.markAsRead(roomId, userId);

    // Reset unread count
    await chatRoomRepository.resetUnreadCount(roomId, participation.userType);

    return {
      success: true,
      message: 'Messages marked as read',
      data: { userId }
    };
  }

  /**
   * Hard delete message (admin only)
   * @param {number} messageId - Message ID
   * @returns {Promise<Object>}
   */
  async hardDeleteMessage(messageId) {
    const message = await chatMessageRepository.getById(messageId, { includeDeleted: true });
    
    if (!message) {
      throw new Error('Message not found');
    }

    // Delete image files if message type is image
    if (message.messageType === 'image' && message.mediaUrl) {
      await deleteFile(message.mediaUrl, message.storageType, { resourceType: 'image' });
      if (message.thumbnailUrl && message.thumbnailUrl !== message.mediaUrl) {
        await deleteFile(message.thumbnailUrl, message.storageType, { resourceType: 'image' });
      }
    }

    const success = await chatMessageRepository.hardDelete(messageId);

    if (!success) {
      throw new Error('Failed to delete message');
    }

    return {
      success: true,
      message: 'Message deleted permanently',
      data: null
    };
  }
}

// Export singleton instance
export default new ChatMessageService();
