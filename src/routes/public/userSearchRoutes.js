import express from 'express';
import PublicUserSearchController from '#controllers/public/userSearchController.js';

const router = express.Router();

// Public routes - no authentication required

// Get popular search queries (public endpoint)
router.get('/popular', PublicUserSearchController.getPopularSearches);

export default router;