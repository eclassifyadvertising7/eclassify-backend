/**
 * ChatMessage Repository
 * Handles database operations for chat messages
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { ChatMessage, User, UserProfile } = models;

class ChatMessageRepository {
  /**
   * Create new message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>}
   */
  async create(messageData) {
    return await ChatMessage.create(messageData);
  }

  /**
   * Get message by ID
   * @param {number} id - Message ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async getById(id, options = {}) {
    const include = options.includeUser ? [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'fullName', 'isVerified', ['created_at', 'createdAt']],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      }
    ] : [];

    return await ChatMessage.findByPk(id, {
      include,
      paranoid: options.includeDeleted ? false : true
    });
  }

  /**
   * Get messages by room with pagination
   * @param {number} chatRoomId - Chat room ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getByRoomId(chatRoomId, pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows } = await ChatMessage.findAndCountAll({
      where: { chatRoomId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'isVerified', ['created_at', 'createdAt']],
          include: [
            {
              model: UserProfile,
              as: 'profile',
              attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
            }
          ]
        },
        {
          model: ChatMessage,
          as: 'replyToMessage',
          attributes: ['id', 'messageText', 'messageType', 'senderId'],
          paranoid: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    return {
      messages: rows.reverse(), // Reverse to show oldest first
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get unread messages count
   * @param {number} chatRoomId - Chat room ID
   * @param {number} userId - User ID (to exclude own messages)
   * @returns {Promise<number>}
   */
  async getUnreadCount(chatRoomId, userId) {
    return await ChatMessage.count({
      where: {
        chatRoomId,
        senderId: { [Op.ne]: userId },
        isRead: false
      }
    });
  }

  /**
   * Get last message for room
   * @param {number} chatRoomId - Chat room ID
   * @returns {Promise<Object|null>}
   */
  async getLastMessage(chatRoomId) {
    return await ChatMessage.findOne({
      where: { chatRoomId },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'messageText', 'messageType', 'createdAt']
    });
  }

  /**
   * Update message
   * @param {number} id - Message ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    const message = await ChatMessage.findByPk(id);
    if (!message) return null;

    await message.update(updateData);
    return message;
  }

  /**
   * Mark messages as read
   * @param {number} chatRoomId - Chat room ID
   * @param {number} userId - User ID (to exclude own messages)
   * @returns {Promise<number>} - Number of affected rows
   */
  async markAsRead(chatRoomId, userId) {
    const [affectedCount] = await ChatMessage.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          chatRoomId,
          senderId: { [Op.ne]: userId },
          isRead: false
        }
      }
    );
    return affectedCount;
  }

  /**
   * Soft delete message
   * @param {number} id - Message ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const message = await ChatMessage.findByPk(id);
    if (!message) return false;

    await message.destroy();
    return true;
  }

  /**
   * Hard delete message (admin only)
   * @param {number} id - Message ID
   * @returns {Promise<boolean>}
   */
  async hardDelete(id) {
    const message = await ChatMessage.findByPk(id, { paranoid: false });
    if (!message) return false;

    await message.destroy({ force: true });
    return true;
  }

  /**
   * Check if message can be edited
   * @param {number} id - Message ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} - Returns { canEdit: boolean, reason: string }
   */
  async canEdit(id, userId) {
    const message = await ChatMessage.findByPk(id, {
      include: [
        {
          model: ChatMessage,
          as: 'replies',
          attributes: ['id']
        }
      ]
    });

    if (!message) {
      return { canEdit: false, reason: 'Message not found' };
    }

    if (message.senderId !== userId) {
      return { canEdit: false, reason: 'Not the sender' };
    }

    if (message.messageType === 'system') {
      return { canEdit: false, reason: 'Cannot edit system messages' };
    }

    if (message.replies && message.replies.length > 0) {
      return { canEdit: false, reason: 'Cannot edit messages with replies' };
    }

    // Check if within 15 minutes
    const now = new Date();
    const createdAt = new Date(message.createdAt);
    const diffMinutes = (now - createdAt) / (1000 * 60);

    if (diffMinutes > 15) {
      return { canEdit: false, reason: 'Edit time expired (15 minutes)' };
    }

    return { canEdit: true, message };
  }

  /**
   * Get total messages count
   * @returns {Promise<number>}
   */
  async getTotalCount() {
    return await ChatMessage.count();
  }

  /**
   * Delete all messages by room ID (cascade on room deletion)
   * @param {number} chatRoomId - Chat room ID
   * @returns {Promise<number>} - Number of deleted messages
   */
  async deleteByRoomId(chatRoomId) {
    const deletedCount = await ChatMessage.destroy({
      where: { chatRoomId },
      force: true
    });
    return deletedCount;
  }
}

// Export singleton instance
export default new ChatMessageRepository();
