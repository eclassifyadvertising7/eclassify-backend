/**
 * Panel Chat Routes
 * Admin/staff endpoints for chat monitoring and moderation
 */

import express from 'express';
import ChatManagementController from '#controllers/panel/chatManagementController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// All routes require super_admin role
router.use(allowRoles(['super_admin']));

// ============================================
// Room Management Routes
// ============================================

// View specific room (action before ID to avoid conflicts)
router.get('/rooms/view/:roomId', ChatManagementController.viewRoom);

// Delete room (action before ID to avoid conflicts)
router.delete('/rooms/delete/:roomId', ChatManagementController.deleteRoom);

// Get all chat rooms
router.get('/rooms/list', ChatManagementController.getRooms);

// ============================================
// Message Moderation Routes
// ============================================

// Delete message (hard delete)
router.delete('/messages/delete/:messageId', ChatManagementController.deleteMessage);

// ============================================
// Report Management Routes
// ============================================

// Resolve report (action before ID to avoid conflicts)
router.patch('/reports/resolve/:roomId', ChatManagementController.resolveReport);

// Get all reported rooms
router.get('/reports/list', ChatManagementController.getReports);

// ============================================
// Analytics Routes
// ============================================

// Get chat statistics
router.get('/analytics/stats', ChatManagementController.getStats);

// Get top listings by offer count
router.get('/analytics/offers/top-listings', ChatManagementController.getTopListings);

// Get offer trends
router.get('/analytics/offers/trends', ChatManagementController.getOfferTrends);

// Get offer acceptance rate
router.get('/analytics/offers/acceptance-rate', ChatManagementController.getAcceptanceRate);

export default router;
