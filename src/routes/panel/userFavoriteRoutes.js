import express from 'express';
import PanelUserFavoriteController from '#controllers/panel/userFavoriteController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

// All panel routes require authentication and admin/staff roles
router.use(authenticate);
router.use(allowRoles(['super_admin', 'admin', 'marketing', 'seo']));

// Get most favorited listings for analytics
router.get('/analytics/most-favorited', PanelUserFavoriteController.getMostFavoritedListings);

// Get favorite analytics and statistics
router.get('/analytics/stats', PanelUserFavoriteController.getFavoriteAnalytics);

// Get favorites breakdown by category
router.get('/analytics/by-category', PanelUserFavoriteController.getFavoritesByCategory);

// Get specific user's favorites (admin view)
router.get('/user/:userId', PanelUserFavoriteController.getUserFavorites);

export default router;