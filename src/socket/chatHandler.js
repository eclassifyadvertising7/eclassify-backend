/**
 * Chat Socket Handler
 * Handles real-time chat events via Socket.io
 */

import chatMessageService from '#services/chatMessageService.js';
import chatRoomService from '#services/chatRoomService.js';
import chatRoomRepository from '#repositories/chatRoomRepository.js';
import logger from '#config/logger.js';

class ChatHandler {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map userId to socket.id
  }

  /**
   * Initialize chat socket handlers
   * @param {Object} socket - Socket.io socket instance
   */
  handleConnection(socket) {
    const userId = socket.userId; // Set by auth middleware

    if (!userId) {
      logger.warn('Socket connection without userId');
      socket.disconnect();
      return;
    }

    // Store user socket mapping
    this.userSockets.set(userId, socket.id);
    logger.info(`User ${userId} connected via socket ${socket.id}`);

    // Handle join room
    socket.on('join_room', async (data) => {
      await this.handleJoinRoom(socket, data);
    });

    // Handle leave room
    socket.on('leave_room', async (data) => {
      await this.handleLeaveRoom(socket, data);
    });

    // Handle send message
    socket.on('send_message', async (data) => {
      await this.handleSendMessage(socket, data);
    });

    // Handle typing indicator
    socket.on('typing', async (data) => {
      await this.handleTyping(socket, data);
    });

    // Handle stop typing
    socket.on('stop_typing', async (data) => {
      await this.handleStopTyping(socket, data);
    });

    // Handle mark as read
    socket.on('mark_read', async (data) => {
      await this.handleMarkRead(socket, data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  /**
   * Handle join room event
   */
  async handleJoinRoom(socket, data) {
    try {
      const { roomId } = data;
      const userId = socket.userId;
      const roleSlug = socket.roleSlug; // Set by socket auth middleware

      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      // Super admin can join any room (spectator mode)
      if (roleSlug === 'super_admin') {
        socket.join(`room_${roomId}`);
        logger.info(`Super admin ${userId} joined room ${roomId} (spectator mode)`);
        socket.emit('joined_room', { roomId, spectatorMode: true });
        return;
      }

      // Validate user access to room (must be buyer or seller)
      const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
      
      if (!participation) {
        logger.warn(`User ${userId} attempted unauthorized socket access to room ${roomId}`);
        socket.emit('error', { message: 'Access denied to this room' });
        return;
      }

      // Join socket room
      socket.join(`room_${roomId}`);
      
      logger.info(`User ${userId} joined room ${roomId} as ${participation.userType}`);
      
      socket.emit('joined_room', { roomId, userType: participation.userType });
    } catch (error) {
      logger.error('Error in handleJoinRoom:', error);
      socket.emit('error', { message: error.message });
    }
  }

  /**
   * Handle leave room event
   */
  async handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data;
      
      if (!roomId) {
        return;
      }

      socket.leave(`room_${roomId}`);
      
      logger.info(`User ${socket.userId} left room ${roomId}`);
    } catch (error) {
      logger.error('Error in handleLeaveRoom:', error);
    }
  }

  /**
   * Handle send message event (text only via socket)
   */
  async handleSendMessage(socket, data) {
    try {
      const { roomId, messageText, replyToMessageId } = data;
      const userId = socket.userId;
      const roleSlug = socket.roleSlug;

      if (!roomId || !messageText) {
        socket.emit('error', { message: 'Room ID and message text are required' });
        return;
      }

      // Super admin cannot send messages (spectator mode only)
      if (roleSlug === 'super_admin') {
        socket.emit('error', { message: 'Super admin cannot send messages in spectator mode' });
        return;
      }

      // Validate user is participant
      const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
      if (!participation) {
        socket.emit('error', { message: 'Access denied to this room' });
        return;
      }

      // Send message via service
      const result = await chatMessageService.sendTextMessage(
        roomId,
        userId,
        messageText,
        replyToMessageId || null
      );

      // Emit to all users in the room
      this.io.to(`room_${roomId}`).emit('new_message', {
        roomId,
        message: {
          id: result.data.messageId,
          senderId: userId,
          messageType: 'text',
          messageText,
          replyToMessageId,
          createdAt: result.data.createdAt
        }
      });

      // Emit chat count update to recipient
      if (result.data.recipientId) {
        const unreadCount = await chatRoomRepository.getTotalUnreadCount(result.data.recipientId);
        this.io.to(`user_${result.data.recipientId}`).emit('chat_count_update', {
          count: unreadCount,
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Message sent in room ${roomId} by user ${userId}`);
    } catch (error) {
      logger.error('Error in handleSendMessage:', error);
      socket.emit('error', { message: error.message });
    }
  }

  /**
   * Handle typing indicator
   */
  async handleTyping(socket, data) {
    try {
      const { roomId } = data;
      const userId = socket.userId;
      const roleSlug = socket.roleSlug;

      if (!roomId) {
        return;
      }

      // Super admin in spectator mode shouldn't emit typing
      if (roleSlug === 'super_admin') {
        return;
      }

      // Validate access
      const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
      
      if (!participation) {
        return;
      }

      // Emit to other users in the room (not to sender)
      socket.to(`room_${roomId}`).emit('user_typing', {
        roomId,
        userId
      });
    } catch (error) {
      logger.error('Error in handleTyping:', error);
    }
  }

  /**
   * Handle stop typing
   */
  async handleStopTyping(socket, data) {
    try {
      const { roomId } = data;
      const userId = socket.userId;

      if (!roomId) {
        return;
      }

      // Emit to other users in the room
      socket.to(`room_${roomId}`).emit('user_stop_typing', {
        roomId,
        userId
      });
    } catch (error) {
      logger.error('Error in handleStopTyping:', error);
    }
  }

  /**
   * Handle mark messages as read
   */
  async handleMarkRead(socket, data) {
    try {
      const { roomId } = data;
      const userId = socket.userId;
      const roleSlug = socket.roleSlug;

      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      // Super admin doesn't mark messages as read (spectator mode)
      if (roleSlug === 'super_admin') {
        return;
      }

      // Validate access
      const participation = await chatRoomRepository.getUserParticipation(roomId, userId);
      if (!participation) {
        socket.emit('error', { message: 'Access denied to this room' });
        return;
      }

      // Mark messages as read via service
      await chatMessageService.markAsRead(roomId, userId);

      // Emit to other users in the room
      socket.to(`room_${roomId}`).emit('message_read', {
        roomId,
        userId,
        readAt: new Date()
      });

      // Emit updated chat count to current user
      const unreadCount = await chatRoomRepository.getTotalUnreadCount(userId);
      this.io.to(`user_${userId}`).emit('chat_count_update', {
        count: unreadCount,
        timestamp: new Date().toISOString()
      });

      logger.info(`Messages marked as read in room ${roomId} by user ${userId}`);
    } catch (error) {
      logger.error('Error in handleMarkRead:', error);
      socket.emit('error', { message: error.message });
    }
  }

  /**
   * Handle disconnect
   */
  handleDisconnect(socket) {
    const userId = socket.userId;
    
    if (userId) {
      this.userSockets.delete(userId);
      logger.info(`User ${userId} disconnected from socket ${socket.id}`);
    }
  }

  /**
   * Emit message deleted event
   * @param {number} roomId - Room ID
   * @param {number} messageId - Message ID
   */
  emitMessageDeleted(roomId, messageId) {
    this.io.to(`room_${roomId}`).emit('message_deleted', {
      roomId,
      messageId
    });
  }

  /**
   * Emit room inactive event
   * @param {number} roomId - Room ID
   * @param {string} reason - Reason for inactivity
   */
  emitRoomInactive(roomId, reason) {
    this.io.to(`room_${roomId}`).emit('room_inactive', {
      roomId,
      reason
    });
  }

  /**
   * Emit offer received event
   * @param {number} roomId - Room ID
   * @param {number} offerId - Offer ID
   * @param {number} amount - Offer amount
   */
  emitOfferReceived(roomId, offerId, amount) {
    this.io.to(`room_${roomId}`).emit('offer_received', {
      roomId,
      offerId,
      amount
    });
  }
}

export default ChatHandler;
