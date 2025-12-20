import express from 'express';
import UserSearchController from '#controllers/end-user/userSearchController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import activityLogMiddleware from '#middleware/activityLogMiddleware.js';

const router = express.Router();

// Apply activity log middleware to all routes for session tracking
router.use(activityLogMiddleware);

// Log search activity (supports anonymous users)
router.post('/log', UserSearchController.logSearch);

// Routes below require authentication
router.use(authenticate);

// Get user search history
router.get('/history', UserSearchController.getSearchHistory);

// Get search recommendations for user
router.get('/recommendations', UserSearchController.getSearchRecommendations);

export default router;