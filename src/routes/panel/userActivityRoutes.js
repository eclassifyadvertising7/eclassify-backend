import express from 'express';
import PanelUserActivityController from '#controllers/panel/userActivityController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

// All panel routes require authentication and admin/staff roles
router.use(authenticate);
router.use(allowRoles(['super_admin', 'admin', 'marketing', 'seo']));

// Get comprehensive activity analytics
router.get('/analytics', PanelUserActivityController.getActivityAnalytics);

// Get detailed activity logs with filtering
router.get('/logs', PanelUserActivityController.getActivityLogs);

// Get activity count by type
router.get('/count-by-type', PanelUserActivityController.getActivityCountByType);

// Get most viewed listings
router.get('/most-viewed', PanelUserActivityController.getMostViewedListings);

// Get conversion rate analytics (views to chat initiations)
router.get('/conversion-rate', PanelUserActivityController.getConversionRate);

// Get activity trends over time
router.get('/trends', PanelUserActivityController.getActivityTrends);

// Get specific user's activity details
router.get('/user/:userId', PanelUserActivityController.getUserActivityDetails);

export default router;