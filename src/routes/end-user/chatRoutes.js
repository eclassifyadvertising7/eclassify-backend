/**
 * End-User Chat Routes
 * User's chat, messaging, and offer endpoints
 */

import express from 'express';
import ChatRoomController from '#controllers/end-user/chatRoomController.js';
import ChatMessageController from '#controllers/end-user/chatMessageController.js';
import ChatOfferController from '#controllers/end-user/chatOfferController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { uploadChatImage } from '#middleware/uploadMiddleware.js';
import { validateRoomAccess, validateMessageAccess } from '#middleware/chatAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// Chat Room Routes
// ============================================

// Create or get existing chat room (action before ID to avoid conflicts)
router.post('/rooms/create', ChatRoomController.createRoom);

// View specific room details (action before ID to avoid conflicts)
router.get('/rooms/view/:roomId', validateRoomAccess(), ChatRoomController.viewRoom);

// Delete chat room (action before ID to avoid conflicts)
router.delete('/rooms/delete/:roomId', validateRoomAccess(), ChatRoomController.deleteRoom);

// Toggle important flag (action before ID to avoid conflicts)
router.patch('/rooms/important/:roomId', validateRoomAccess(), ChatRoomController.toggleImportant);

// Block/unblock user (action before ID to avoid conflicts)
router.patch('/rooms/block/:roomId', validateRoomAccess(), ChatRoomController.blockUser);

// Report user/room (action before ID to avoid conflicts)
router.post('/rooms/report/:roomId', validateRoomAccess(), ChatRoomController.reportUser);

// Get user's chat rooms with filters
router.get('/rooms', ChatRoomController.getRooms);

// ============================================
// Chat Message Routes
// ============================================

// Send message (text/image/location) - action before ID to avoid conflicts
router.post('/messages/send/:roomId', validateRoomAccess(), uploadChatImage, ChatMessageController.sendMessage);

// Get messages for room (action before ID to avoid conflicts)
router.get('/messages/list/:roomId', validateRoomAccess(), ChatMessageController.getMessages);

// Edit message (action before ID to avoid conflicts)
router.patch('/messages/edit/:messageId', validateMessageAccess(), ChatMessageController.editMessage);

// Delete message (action before ID to avoid conflicts)
router.delete('/messages/delete/:messageId', validateMessageAccess(), ChatMessageController.deleteMessage);

// Mark messages as read (action before ID to avoid conflicts)
router.patch('/messages/mark-read/:roomId', validateRoomAccess(), ChatMessageController.markAsRead);

// ============================================
// Offer Routes
// ============================================

// Create offer (action before ID to avoid conflicts)
router.post('/offers/create/:roomId', validateRoomAccess(), ChatOfferController.createOffer);

// Get offers for room (action before ID to avoid conflicts)
router.get('/offers/list/:roomId', validateRoomAccess(), ChatOfferController.getOffers);

// Accept offer (action before ID to avoid conflicts)
router.patch('/offers/accept/:offerId', ChatOfferController.acceptOffer);

// Reject offer (action before ID to avoid conflicts)
router.patch('/offers/reject/:offerId', ChatOfferController.rejectOffer);

// Withdraw offer (action before ID to avoid conflicts)
router.patch('/offers/withdraw/:offerId', ChatOfferController.withdrawOffer);

// Counter offer (action before ID to avoid conflicts)
router.post('/offers/counter/:offerId', ChatOfferController.counterOffer);

// ============================================
// Contact Sharing Routes
// ============================================

// Request contact information (buyer)
router.post('/contact/request/:roomId', validateRoomAccess(), ChatOfferController.requestContact);

// Share contact information (seller)
router.post('/contact/share/:roomId', validateRoomAccess(), ChatOfferController.shareContact);

export default router;
