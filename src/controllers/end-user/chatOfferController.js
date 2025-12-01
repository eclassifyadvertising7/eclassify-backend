/**
 * End-User ChatOffer Controller
 * Handles user's offer operations in chat
 */

import listingOfferService from '#services/listingOfferService.js';
import chatRoomService from '#services/chatRoomService.js';
import { successResponse, errorResponse, createResponse } from '#utils/responseFormatter.js';

class ChatOfferController {
  /**
   * Create offer (buyer)
   * POST /api/end-user/chats/offers/create/:roomId
   */
  static async createOffer(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { amount, notes, expiresAt } = req.body;

      if (!amount) {
        return errorResponse(res, 'Offer amount is required', 400);
      }

      const offerData = {
        amount: parseFloat(amount),
        notes: notes?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      const result = await listingOfferService.createOffer(
        parseInt(roomId),
        userId,
        offerData
      );
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get offers for room
   * GET /api/end-user/chats/offers/list/:roomId
   */
  static async getOffers(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;

      const result = await listingOfferService.getOffers(
        parseInt(roomId),
        userId
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Accept offer (seller)
   * PATCH /api/end-user/chats/offers/accept/:offerId
   */
  static async acceptOffer(req, res) {
    try {
      const userId = req.user.userId;
      const { offerId } = req.params;

      const result = await listingOfferService.acceptOffer(
        parseInt(offerId),
        userId
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Reject offer (seller)
   * PATCH /api/end-user/chats/offers/reject/:offerId
   */
  static async rejectOffer(req, res) {
    try {
      const userId = req.user.userId;
      const { offerId } = req.params;
      const { reason } = req.body;

      const result = await listingOfferService.rejectOffer(
        parseInt(offerId),
        userId,
        reason?.trim() || null
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Withdraw offer (buyer)
   * PATCH /api/end-user/chats/offers/withdraw/:offerId
   */
  static async withdrawOffer(req, res) {
    try {
      const userId = req.user.userId;
      const { offerId } = req.params;

      const result = await listingOfferService.withdrawOffer(
        parseInt(offerId),
        userId
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Counter offer (seller)
   * POST /api/end-user/chats/offers/counter/:offerId
   */
  static async counterOffer(req, res) {
    try {
      const userId = req.user.userId;
      const { offerId } = req.params;
      const { amount, notes, expiresAt } = req.body;

      if (!amount) {
        return errorResponse(res, 'Counter offer amount is required', 400);
      }

      const counterData = {
        amount: parseFloat(amount),
        notes: notes?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      const result = await listingOfferService.counterOffer(
        parseInt(offerId),
        userId,
        counterData
      );
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Request contact information (buyer)
   * POST /api/end-user/chats/contact/request/:roomId
   */
  static async requestContact(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;

      const result = await chatRoomService.requestContact(
        parseInt(roomId),
        userId
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Share contact information (seller)
   * POST /api/end-user/chats/contact/share/:roomId
   */
  static async shareContact(req, res) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.params;
      const { phone, email } = req.body;

      if (!phone && !email) {
        return errorResponse(res, 'At least phone or email is required', 400);
      }

      const contactData = {
        phone: phone?.trim() || null,
        email: email?.trim() || null
      };

      const result = await chatRoomService.shareContact(
        parseInt(roomId),
        userId,
        contactData
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ChatOfferController;
