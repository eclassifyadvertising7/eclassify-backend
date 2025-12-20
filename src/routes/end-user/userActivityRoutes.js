import express from 'express';
import UserActivityController from '#controllers/end-user/userActivityController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import activityLogMiddleware from '#middleware/activityLogMiddleware.js';

const router = express.Router();

// Apply activity log middleware to all routes for session tracking
router.use(activityLogMiddleware);

// Log listing view (supports anonymous users)
router.post('/log-view', UserActivityController.logListingView);

// Log chat initiation (requires authentication)
router.post('/log-chat', authenticate, UserActivityController.logChatInitiation);

// Update view duration (for tracking time spent on page)
router.patch('/update-view-duration', UserActivityController.updateViewDuration);

// Routes below require authentication
router.use(authenticate);

// Get user activity summary
router.get('/summary', UserActivityController.getActivitySummary);

export default router;