import express from 'express';
import authRoutes from './auth/authRoutes.js';
import commonLocationRoutes from './common/locationRoutes.js';
import commonProfileRoutes from './common/profileRoutes.js';
import subscriptionRoutes from './end-user/subscriptionRoutes.js';
import subscriptionPlanRoutes from './panel/subscriptionPlanRoutes.js';
import panelSubscriptionRoutes from './panel/subscriptionRoutes.js';
// TEMPORARY: Manual payment routes - Delete when payment gateway is implemented
import { endUserRouter as manualPaymentEndUserRoutes, panelRouter as manualPaymentPanelRoutes, publicRouter as manualPaymentPublicRoutes } from './temp/manualPaymentRoutes.js';
import publicCategoryRoutes from './public/categoryRoutes.js';
import panelCategoryRoutes from './panel/categoryRoutes.js';
import endUserListingRoutes from './end-user/listingRoutes.js';
import panelListingRoutes from './panel/listingRoutes.js';
import publicListingRoutes from './public/listingRoutes.js';
import publicCarDataRoutes from './public/carDataRoutes.js';
import publicSubscriptionPlanRoutes from './public/subscriptionPlanRoutes.js';
import panelCarDataRoutes from './panel/carDataRoutes.js';
import endUserDataRequestRoutes from './end-user/dataRequestRoutes.js';
import panelDataRequestRoutes from './panel/dataRequestRoutes.js';
import endUserChatRoutes from './end-user/chatRoutes.js';
import panelChatRoutes from './panel/chatRoutes.js';
import panelUserManagementRoutes from './panel/userManagementRoutes.js';
import endUserInvoiceRoutes from './end-user/invoiceRoutes.js';
import endUserTransactionRoutes from './end-user/transactionRoutes.js';
import panelInvoiceRoutes from './panel/invoiceRoutes.js';
import panelTransactionRoutes from './panel/transactionRoutes.js';

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
router.use('/end-user/chats', endUserChatRoutes);
router.use('/end-user/invoices', endUserInvoiceRoutes);
router.use('/end-user/transactions', endUserTransactionRoutes);
router.use('/panel/subscription-plans', subscriptionPlanRoutes);
router.use('/panel/subscriptions', panelSubscriptionRoutes);
// TEMPORARY: Manual payment routes - Delete when payment gateway is implemented
router.use('/manual-payments', manualPaymentEndUserRoutes); // End user routes
router.use('/panel/manual-payments', manualPaymentPanelRoutes); // Admin routes
router.use('/public/manual-payments', manualPaymentPublicRoutes); // Public routes
router.use('/panel/listings', panelListingRoutes);
router.use('/panel/categories', panelCategoryRoutes);
router.use('/panel/data-requests', panelDataRequestRoutes);
router.use('/panel/chats', panelChatRoutes);
router.use('/panel/users', panelUserManagementRoutes);
router.use('/panel/invoices', panelInvoiceRoutes);
router.use('/panel/transactions', panelTransactionRoutes);
router.use('/panel', panelCarDataRoutes);
router.use('/public/categories', publicCategoryRoutes);
router.use('/public/listings', publicListingRoutes);
router.use('/public/subscription-plans', publicSubscriptionPlanRoutes);
router.use('/public', publicCarDataRoutes);

// Export router for use in app.js
export default router;
