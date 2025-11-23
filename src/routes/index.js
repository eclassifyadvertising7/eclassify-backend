import express from 'express';
import authRoutes from './auth/authRoutes.js';
import commonLocationRoutes from './common/locationRoutes.js';
import commonProfileRoutes from './common/profileRoutes.js';
import subscriptionRoutes from './end-user/subscriptionRoutes.js';
import subscriptionPlanRoutes from './panel/subscriptionPlanRoutes.js';

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
router.use('/panel/subscription-plans', subscriptionPlanRoutes);

// Export router for use in app.js
export default router;
