import chatRoomService from '#services/chatRoomService.js';
import chatMessageService from '#services/chatMessageService.js';
import listingOfferService from '#services/listingOfferService.js';
import chatRoomRepository from '#repositories/chatRoomRepository.js';
import chatMessageRepository from '#repositories/chatMessageRepository.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class ChatManagementController {
  static async getRooms(req, res) {
    try {
      const filters = {
        reported: req.query.reported === 'true',
        blocked: req.query.blocked === 'true',
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await chatRoomRepository.getAll(filters, pagination);
      return successResponse(res, result.rooms, 'Chat rooms retrieved successfully', result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async viewRoom(req, res) {
    try {
      const { roomId } = req.params;

      const room = await chatRoomRepository.getById(parseInt(roomId), { includeAll: true });
      
      if (!room) {
        return errorResponse(res, 'Chat room not found', 404);
      }

      const messages = await chatMessageRepository.getByRoomId(parseInt(roomId), { limit: 100 });

      const offers = await listingOfferService.getOffers(parseInt(roomId), room.buyerId);

      return successResponse(res, {
        room,
        messages: messages.messages,
        offers: offers.data
      }, 'Chat room details retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;

      const success = await chatRoomRepository.delete(parseInt(roomId));
      
      if (!success) {
        return errorResponse(res, 'Chat room not found', 404);
      }

      return successResponse(res, null, 'Chat room deleted permanently');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;

      const result = await chatMessageService.hardDeleteMessage(parseInt(messageId));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getReports(req, res) {
    try {
      const filters = {
        reported: true,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await chatRoomRepository.getAll(filters, pagination);

      const reports = result.rooms.map(room => {
        const reportMetadata = room.reportMetadata || [];
        return reportMetadata.map(report => ({
          roomId: room.id,
          listingId: room.listingId,
          reportedBy: report.reportedBy,
          reportedUser: report.reportedUser,
          type: report.type,
          reason: report.reason,
          reportedAt: report.reportedAt,
          status: report.status || 'pending',
          room: {
            id: room.id,
            isActive: room.isActive,
            listing: room.listing,
            buyer: room.buyer,
            seller: room.seller
          }
        }));
      }).flat();

      return successResponse(res, reports, 'Reports retrieved successfully', result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async resolveReport(req, res) {
    try {
      const { roomId } = req.params;
      const { action, adminNotes } = req.body;

      if (!action) {
        return errorResponse(res, 'Action is required (dismissed, warned, suspended)', 400);
      }

      const room = await chatRoomRepository.getById(parseInt(roomId));
      
      if (!room) {
        return errorResponse(res, 'Chat room not found', 404);
      }

      const reportMetadata = room.reportMetadata || [];
      const updatedReports = reportMetadata.map(report => ({
        ...report,
        status: 'resolved',
        action,
        adminNotes,
        resolvedAt: new Date().toISOString(),
        resolvedBy: req.user.userId
      }));

      await chatRoomRepository.update(parseInt(roomId), {
        reportMetadata: updatedReports,
        reportedByBuyer: false,
        reportedBySeller: false
      });

      return successResponse(res, null, 'Report resolved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getStats(req, res) {
    try {
      const result = await chatRoomService.getStats();
      
      const totalMessages = await chatMessageRepository.getTotalCount();
      
      return successResponse(res, {
        ...result.data,
        totalMessages
      }, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getTopListings(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      const result = await listingOfferService.getTopListings(limit);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getOfferTrends(req, res) {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;
      
      const result = await listingOfferService.getOfferTrends(days);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAcceptanceRate(req, res) {
    try {
      const filters = {};
      
      if (req.query.listingId) {
        filters.listingId = parseInt(req.query.listingId);
      }
      
      const result = await listingOfferService.getStats(filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ChatManagementController;
