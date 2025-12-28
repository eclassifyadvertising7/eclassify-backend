import chatRoomRepository from '#repositories/chatRoomRepository.js';
import userNotificationRepository from '#repositories/userNotificationRepository.js';
import logger from '#config/logger.js';

class UnreadCountHandler {
  constructor(io) {
    this.io = io;
  }

  handleConnection(socket) {
    const userId = socket.userId;

    if (!userId) {
      logger.warn('UnreadCountHandler: Socket connection without userId');
      return;
    }

    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined personal room for unread counts`);

    this.emitInitialCounts(socket, userId);

    socket.on('request_unread_counts', async () => {
      await this.handleRequestCounts(socket, userId);
    });
  }

  async emitInitialCounts(socket, userId) {
    try {
      const [unreadChats, unreadNotifications] = await Promise.all([
        chatRoomRepository.getTotalUnreadCount(userId),
        userNotificationRepository.getUnreadCount(userId)
      ]);

      socket.emit('unread_counts', {
        chats: unreadChats,
        notifications: unreadNotifications,
        timestamp: new Date().toISOString()
      });

      logger.info(`Initial counts emitted to user ${userId}: chats=${unreadChats}, notifications=${unreadNotifications}`);
    } catch (error) {
      logger.error(`Failed to emit initial counts for user ${userId}:`, error);
      socket.emit('error', { message: 'Failed to fetch unread counts' });
    }
  }

  async handleRequestCounts(socket, userId) {
    try {
      const [unreadChats, unreadNotifications] = await Promise.all([
        chatRoomRepository.getTotalUnreadCount(userId),
        userNotificationRepository.getUnreadCount(userId)
      ]);

      socket.emit('unread_counts', {
        chats: unreadChats,
        notifications: unreadNotifications,
        timestamp: new Date().toISOString()
      });

      logger.info(`Counts requested by user ${userId}: chats=${unreadChats}, notifications=${unreadNotifications}`);
    } catch (error) {
      logger.error(`Failed to handle count request for user ${userId}:`, error);
      socket.emit('error', { message: 'Failed to fetch unread counts' });
    }
  }

  emitChatCountUpdate(userId, unreadCount) {
    this.io.to(`user_${userId}`).emit('chat_count_update', {
      count: unreadCount,
      timestamp: new Date().toISOString()
    });
    logger.info(`Chat count update emitted to user ${userId}: ${unreadCount}`);
  }

  emitNotificationCountUpdate(userId, unreadCount) {
    this.io.to(`user_${userId}`).emit('notification_count_update', {
      count: unreadCount,
      timestamp: new Date().toISOString()
    });
    logger.info(`Notification count update emitted to user ${userId}: ${unreadCount}`);
  }

  emitBothCountsUpdate(userId, chatCount, notificationCount) {
    this.io.to(`user_${userId}`).emit('unread_counts', {
      chats: chatCount,
      notifications: notificationCount,
      timestamp: new Date().toISOString()
    });
    logger.info(`Both counts emitted to user ${userId}: chats=${chatCount}, notifications=${notificationCount}`);
  }
}

export default UnreadCountHandler;
