import express from 'express';
import UserNotificationController from '#controllers/end-user/userNotificationController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user notifications with pagination and filters
// GET /api/end-user/notifications?page=1&limit=20&category=listing&isRead=false
router.get('/', UserNotificationController.getUserNotifications);

// Get unread notifications count
// GET /api/end-user/notifications/unread-count
router.get('/unread-count', UserNotificationController.getUnreadCount);

// Get notification statistics
// GET /api/end-user/notifications/stats?days=30
router.get('/stats', UserNotificationController.getNotificationStats);

// Get user notification preferences
// GET /api/end-user/notifications/preferences
router.get('/preferences', UserNotificationController.getUserPreferences);

// Update user notification preferences
// PUT /api/end-user/notifications/preferences
router.put('/preferences', UserNotificationController.updateUserPreferences);

// Mark all notifications as read
// PATCH /api/end-user/notifications/mark-all-read
router.patch('/mark-all-read', UserNotificationController.markAllAsRead);

// Mark multiple notifications as read
// PATCH /api/end-user/notifications/mark-multiple-read
router.patch('/mark-multiple-read', UserNotificationController.markMultipleAsRead);

// Get single notification by ID
// GET /api/end-user/notifications/:id
router.get('/:id', UserNotificationController.getNotificationById);

// Mark notification as read
// PATCH /api/end-user/notifications/:id/read
router.patch('/:id/read', UserNotificationController.markAsRead);

// Delete notification
// DELETE /api/end-user/notifications/:id
router.delete('/:id', UserNotificationController.deleteNotification);

export default router;