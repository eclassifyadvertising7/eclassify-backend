import express from 'express';
import PanelUserSearchController from '#controllers/panel/userSearchController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

// All panel routes require authentication and admin/staff roles
router.use(authenticate);
router.use(allowRoles(['super_admin', 'admin', 'marketing', 'seo']));

// Get comprehensive search analytics
router.get('/analytics', PanelUserSearchController.getSearchAnalytics);

// Get failed searches for content optimization
router.get('/failed', PanelUserSearchController.getFailedSearches);

// Get search conversion metrics
router.get('/conversion', PanelUserSearchController.getConversionMetrics);

// Get popular search queries
router.get('/popular', PanelUserSearchController.getPopularSearches);

// Get top searched categories
router.get('/top-categories', PanelUserSearchController.getTopCategories);

// Get detailed search logs with filtering
router.get('/logs', PanelUserSearchController.getSearchLogs);

// Get user-specific search patterns
router.get('/user-patterns/:userId', PanelUserSearchController.getUserSearchPatterns);

export default router;