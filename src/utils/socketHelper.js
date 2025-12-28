import chatRoomRepository from '#repositories/chatRoomRepository.js';
import userNotificationRepository from '#repositories/userNotificationRepository.js';
import logger from '#config/logger.js';

class SocketHelper {
  static getUnreadCountHandler(req) {
    return req.app.get('unreadCountHandler');
  }

  static async emitChatCountUpdate(req, userId) {
    try {
      const unreadCountHandler = this.getUnreadCountHandler(req);
      if (!unreadCountHandler) {
        logger.warn('UnreadCountHandler not available');
        return;
      }

      const unreadCount = await chatRoomRepository.getTotalUnreadCount(userId);
      unreadCountHandler.emitChatCountUpdate(userId, unreadCount);
    } catch (error) {
      logger.error(`Failed to emit chat count update for user ${userId}:`, error);
    }
  }

  static async emitNotificationCountUpdate(req, userId) {
    try {
      const unreadCountHandler = this.getUnreadCountHandler(req);
      if (!unreadCountHandler) {
        logger.warn('UnreadCountHandler not available');
        return;
      }

      const unreadCount = await userNotificationRepository.getUnreadCount(userId);
      unreadCountHandler.emitNotificationCountUpdate(userId, unreadCount);
    } catch (error) {
      logger.error(`Failed to emit notification count update for user ${userId}:`, error);
    }
  }

  static async emitBothCountsUpdate(req, userId) {
    try {
      const unreadCountHandler = this.getUnreadCountHandler(req);
      if (!unreadCountHandler) {
        logger.warn('UnreadCountHandler not available');
        return;
      }

      const [chatCount, notificationCount] = await Promise.all([
        chatRoomRepository.getTotalUnreadCount(userId),
        userNotificationRepository.getUnreadCount(userId)
      ]);

      unreadCountHandler.emitBothCountsUpdate(userId, chatCount, notificationCount);
    } catch (error) {
      logger.error(`Failed to emit both counts update for user ${userId}:`, error);
    }
  }
}

export default SocketHelper;
