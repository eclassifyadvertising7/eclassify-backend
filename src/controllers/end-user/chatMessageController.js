import chatMessageService from '#services/chatMessageService.js';
import { successResponse, errorResponse, createResponse } from '#utils/responseFormatter.js';

class ChatMessageController {
  static async sendMessage(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { messageType, messageText, replyToMessageId, locationData } = req.body;

      if (!messageType) {
        return errorResponse(res, 'Message type is required', 400);
      }

      let result;

      if (messageType === 'text') {
        if (!messageText) {
          return errorResponse(res, 'Message text is required for text messages', 400);
        }
        result = await chatMessageService.sendTextMessage(
          parseInt(roomId),
          userId,
          messageText,
          replyToMessageId ? parseInt(replyToMessageId) : null
        );
      } else if (messageType === 'image') {
        if (!req.file) {
          return errorResponse(res, 'Image file is required for image messages', 400);
        }
        result = await chatMessageService.sendImageMessage(
          parseInt(roomId),
          userId,
          req.file,
          messageText
        );

        const io = req.app.get('io');
        if (io) {
          io.to(`room_${roomId}`).emit('new_message', {
            roomId: parseInt(roomId),
            message: {
              id: result.data.messageId,
              senderId: userId,
              messageType: 'image',
              messageText: messageText || null,
              createdAt: result.data.createdAt
            }
          });
        }
      } else if (messageType === 'location') {
        if (!locationData) {
          return errorResponse(res, 'Location data is required for location messages', 400);
        }
        const location = typeof locationData === 'string' ? JSON.parse(locationData) : locationData;
        result = await chatMessageService.sendLocationMessage(
          parseInt(roomId),
          userId,
          location,
          messageText
        );

        const io = req.app.get('io');
        if (io) {
          io.to(`room_${roomId}`).emit('new_message', {
            roomId: parseInt(roomId),
            message: {
              id: result.data.messageId,
              senderId: userId,
              messageType: 'location',
              messageText: messageText || null,
              messageMetadata: location,
              createdAt: result.data.createdAt
            }
          });
        }
      } else {
        return errorResponse(res, 'Invalid message type', 400);
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getMessages(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 50
      };

      const result = await chatMessageService.getMessages(
        parseInt(roomId),
        userId,
        pagination
      );
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async editMessage(req, res) {
    try {
      const userId = req.user.userId;
      const { messageId } = req.params;
      const { messageText } = req.body;

      if (!messageText) {
        return errorResponse(res, 'Message text is required', 400);
      }

      const result = await chatMessageService.editMessage(
        parseInt(messageId),
        userId,
        messageText
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteMessage(req, res) {
    try {
      const userId = req.user.userId;
      const { messageId } = req.params;

      const result = await chatMessageService.deleteMessage(
        parseInt(messageId),
        userId
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async markAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;

      const result = await chatMessageService.markAsRead(
        parseInt(roomId),
        userId
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ChatMessageController;
