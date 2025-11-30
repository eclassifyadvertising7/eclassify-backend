/**
 * End-User ChatRoom Controller
 * Handles user's chat room operations
 */

import chatRoomService from '#services/chatRoomService.js';
import { successResponse, errorResponse, createResponse } from '#utils/responseFormatter.js';

class ChatRoomController {
  /**
   * Get user's chat rooms with filters
   * GET /api/end-user/chats/rooms
   */
  static async getRooms(req, res) {
    try {
      const userId = req.user.userId;

      const filters = {
        main: req.query.main || 'all', // all, buying, selling
        sub: req.query.sub || 'all', // all, unread, important, elite_buyer, elite_seller
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : true
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await chatRoomService.getRooms(userId, filters, pagination);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Create or get existing chat room
   * POST /api/end-user/chats/rooms/create
   */
  static async createRoom(req, res) {
    try {
      const userId = req.user.userId;
      const { listingId } = req.body;

      if (!listingId) {
        return errorResponse(res, 'Listing ID is required', 400);
      }

      const result = await chatRoomService.createOrGet(parseInt(listingId), userId);
      
      if (result.data.isNew) {
        return createResponse(res, result.data, result.message);
      }
      
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get specific room details
   * GET /api/end-user/chats/rooms/view/:roomId
   */
  static async viewRoom(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;

      const result = await chatRoomService.getRoomDetails(parseInt(roomId), userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Delete chat room
   * DELETE /api/end-user/chats/rooms/delete/:roomId
   */
  static async deleteRoom(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;

      const result = await chatRoomService.deleteRoom(parseInt(roomId), userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Toggle important flag
   * PATCH /api/end-user/chats/rooms/important/:roomId
   */
  static async toggleImportant(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { isImportant } = req.body;

      if (isImportant === undefined) {
        return errorResponse(res, 'isImportant field is required', 400);
      }

      const result = await chatRoomService.toggleImportant(
        parseInt(roomId),
        userId,
        isImportant === true || isImportant === 'true'
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Block/unblock user
   * PATCH /api/end-user/chats/rooms/block/:roomId
   */
  static async blockUser(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { blocked, reason } = req.body;

      if (blocked === undefined) {
        return errorResponse(res, 'blocked field is required', 400);
      }

      const result = await chatRoomService.blockUser(
        parseInt(roomId),
        userId,
        blocked === true || blocked === 'true',
        reason
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Report user/room
   * POST /api/end-user/chats/rooms/report/:roomId
   */
  static async reportUser(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { reportType, reason } = req.body;

      if (!reportType || !reason) {
        return errorResponse(res, 'Report type and reason are required', 400);
      }

      const result = await chatRoomService.reportUser(
        parseInt(roomId),
        userId,
        reportType,
        reason
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ChatRoomController;
