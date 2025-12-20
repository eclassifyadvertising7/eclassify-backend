import express from 'express';
import PanelUserNotificationController from '#controllers/panel/userNotificationController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply role-based access control - only admin and above can access panel notifications
router.use(allowRoles(['super_admin', 'admin', 'marketing']));

// Send broadcast notification to multiple users
// POST /api/panel/notifications/broadcast
router.post('/broadcast', PanelUserNotificationController.sendBroadcastNotification);

// Get notification statistics for admin dashboard
// GET /api/panel/notifications/stats?days=30&category=listing
router.get('/stats', PanelUserNotificationController.getNotificationStats);

// Process scheduled notifications manually (admin action)
// POST /api/panel/notifications/process-scheduled
router.post('/process-scheduled', PanelUserNotificationController.processScheduledNotifications);

// Cleanup expired notifications manually (admin action)
// POST /api/panel/notifications/cleanup-expired
router.post('/cleanup-expired', PanelUserNotificationController.cleanupExpiredNotifications);

// Send notification to specific user
// POST /api/panel/notifications/users/:userId
router.post('/users/:userId', PanelUserNotificationController.sendNotificationToUser);

// Get user's notifications (admin view)
// GET /api/panel/notifications/users/:userId?page=1&limit=20&includeExpired=true
router.get('/users/:userId', PanelUserNotificationController.getUserNotifications);

// Get user's notification preferences (admin view)
// GET /api/panel/notifications/users/:userId/preferences
router.get('/users/:userId/preferences', PanelUserNotificationController.getUserPreferences);

// Update user's notification preferences (admin action)
// PUT /api/panel/notifications/users/:userId/preferences
router.put('/users/:userId/preferences', PanelUserNotificationController.updateUserPreferences);

export default router;