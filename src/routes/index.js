import express from 'express';
import authRoutes from './auth/authRoutes.js';
import commonLocationRoutes from './common/locationRoutes.js';
import commonProfileRoutes from './common/profileRoutes.js';
import subscriptionRoutes from './end-user/subscriptionRoutes.js';
import subscriptionPlanRoutes from './panel/subscriptionPlanRoutes.js';
import publicCategoryRoutes from './public/categoryRoutes.js';
import panelCategoryRoutes from './panel/categoryRoutes.js';
import endUserListingRoutes from './end-user/listingRoutes.js';
import panelListingRoutes from './panel/listingRoutes.js';
import publicListingRoutes from './public/listingRoutes.js';
import publicCarDataRoutes from './public/carDataRoutes.js';
import panelCarDataRoutes from './panel/carDataRoutes.js';
import endUserDataRequestRoutes from './end-user/dataRequestRoutes.js';
import panelDataRequestRoutes from './panel/dataRequestRoutes.js';

// Create main router
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// Mount feature routes
router.use('/auth', authRoutes);
router.use('/common', commonLocationRoutes);
router.use('/profile', commonProfileRoutes);
router.use('/end-user/subscriptions', subscriptionRoutes);
router.use('/end-user/listings', endUserListingRoutes);
router.use('/end-user/data-requests', endUserDataRequestRoutes);
router.use('/panel/subscription-plans', subscriptionPlanRoutes);
router.use('/panel/listings', panelListingRoutes);
router.use('/panel/categories', panelCategoryRoutes);
router.use('/panel/data-requests', panelDataRequestRoutes);
router.use('/panel', panelCarDataRoutes);
router.use('/public/categories', publicCategoryRoutes);
router.use('/public/listings', publicListingRoutes);
router.use('/public', publicCarDataRoutes);

// Export router for use in app.js
export default router;
