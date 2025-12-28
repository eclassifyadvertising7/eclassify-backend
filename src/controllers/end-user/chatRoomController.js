import chatRoomService from '#services/chatRoomService.js';
import { successResponse, errorResponse, createResponse } from '#utils/responseFormatter.js';

class ChatRoomController {
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

  static async viewRoom(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const isSuperAdmin = req.isSuperAdminAccess || false;

      const result = await chatRoomService.getRoomDetails(parseInt(roomId), userId, isSuperAdmin);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async deleteRoom(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const isSuperAdmin = req.isSuperAdminAccess || false;

      const result = await chatRoomService.deleteRoom(parseInt(roomId), userId, isSuperAdmin);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async toggleImportant(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { isImportant } = req.body;
      const isSuperAdmin = req.isSuperAdminAccess || false;

      if (isImportant === undefined) {
        return errorResponse(res, 'isImportant field is required', 400);
      }

      const result = await chatRoomService.toggleImportant(
        parseInt(roomId),
        userId,
        isImportant === true || isImportant === 'true',
        isSuperAdmin
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async blockUser(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { blocked, reason } = req.body;
      const isSuperAdmin = req.isSuperAdminAccess || false;

      if (blocked === undefined) {
        return errorResponse(res, 'blocked field is required', 400);
      }

      const result = await chatRoomService.blockUser(
        parseInt(roomId),
        userId,
        blocked === true || blocked === 'true',
        reason,
        isSuperAdmin
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async reportUser(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { reportType, reason } = req.body;
      const isSuperAdmin = req.isSuperAdminAccess || false;

      if (!reportType || !reason) {
        return errorResponse(res, 'Report type and reason are required', 400);
      }

      const result = await chatRoomService.reportUser(
        parseInt(roomId),
        userId,
        reportType,
        reason,
        isSuperAdmin
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ChatRoomController;
