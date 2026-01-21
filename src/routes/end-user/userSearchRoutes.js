import express from 'express';
import UserSearchController from '#controllers/end-user/userSearchController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import activityLogMiddleware from '#middleware/activityLogMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(activityLogMiddleware);

// Log search activity
router.post('/log', UserSearchController.logSearch);

// Get user search history
router.get('/history', UserSearchController.getSearchHistory);

// Get search recommendations for user
router.get('/recommendations', UserSearchController.getSearchRecommendations);

export default router;