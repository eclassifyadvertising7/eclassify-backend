/**
 * Chat Access Control Middleware
 * Validates user access to chat rooms
 * - Regular users (role: 'user') can only access rooms where they are buyer OR seller
 * - Super admin can access ANY room (for monitoring/moderation)
 */

import chatRoomRepository from '#repositories/chatRoomRepository.js';
import { ERROR_MESSAGES } from '#utils/constants/messages.js';
import logger from '#config/logger.js';

/**
 * Validate user has access to chat room
 * Checks room participation or super_admin role
 * 
 * @param {string} paramName - Name of route parameter containing roomId (default: 'roomId')
 * @returns {Function} Express middleware function
 */
export const validateRoomAccess = (paramName = 'roomId') => {
  return async (req, res, next) => {
    try {
      // User must be authenticated (handled by authenticate middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      const roomId = parseInt(req.params[paramName]);
      const userId = req.user.userId;
      const roleSlug = req.user.roleSlug;

      if (!roomId || isNaN(roomId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid room ID',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // Super admin can access any room (spectator mode)
      if (roleSlug === 'super_admin') {
        // Log admin access for audit trail
        logger.info(`Super admin ${userId} accessing chat room ${roomId}`);
        
        // Attach admin flag to request for downstream use
        req.isSuperAdminAccess = true;
        return next();
      }

      // Regular users must be participants (buyer or seller)
      const participation = await chatRoomRepository.getUserParticipation(roomId, userId);

      if (!participation) {
        logger.warn(`User ${userId} attempted unauthorized access to room ${roomId}`);
        return res.status(403).json({
          success: false,
          message: ERROR_MESSAGES.FORBIDDEN,
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // Attach participation info to request for downstream use
      req.chatParticipation = participation;
      return next();
    } catch (error) {
      logger.error('Error in validateRoomAccess middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate room access',
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Validate user has access to message
 * Checks if message belongs to a room the user has access to
 * 
 * @returns {Function} Express middleware function
 */
export const validateMessageAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      const messageId = parseInt(req.params.messageId);
      const userId = req.user.userId;
      const roleSlug = req.user.roleSlug;

      if (!messageId || isNaN(messageId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid message ID',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // Import ChatMessage model dynamically to avoid circular dependency
      const models = (await import('#models/index.js')).default;
      const { ChatMessage } = models;

      // Get message with room info
      const message = await ChatMessage.findByPk(messageId, {
        attributes: ['id', 'chatRoomId', 'senderId']
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // Super admin can access any message
      if (roleSlug === 'super_admin') {
        logger.info(`Super admin ${userId} accessing message ${messageId} in room ${message.chatRoomId}`);
        req.isSuperAdminAccess = true;
        req.message = message;
        return next();
      }

      // Regular users must be participants in the room
      const participation = await chatRoomRepository.getUserParticipation(message.chatRoomId, userId);

      if (!participation) {
        logger.warn(`User ${userId} attempted unauthorized access to message ${messageId}`);
        return res.status(403).json({
          success: false,
          message: ERROR_MESSAGES.FORBIDDEN,
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // Attach message and participation info to request
      req.message = message;
      req.chatParticipation = participation;
      return next();
    } catch (error) {
      logger.error('Error in validateMessageAccess middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate message access',
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  };
};
