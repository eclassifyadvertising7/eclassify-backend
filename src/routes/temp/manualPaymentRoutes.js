import express from 'express';
import ManualPaymentController from '#controllers/temp/manualPaymentController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const endUserRouter = express.Router();
const panelRouter = express.Router();

/**
 * TEMPORARY ROUTES - Delete this entire file when payment gateway is implemented
 * 
 * These routes handle manual payment verification flow:
 * 1. End user submits manual payment with proof
 * 2. Admin lists subscriptions for verification
 * 3. Admin verifies or cancels subscriptions
 */

// ==================== END USER ROUTES ====================

/**
 * @route   POST /api/manual-payments/create
 * @desc    Create subscription with manual payment (with optional proof upload)
 * @access  Authenticated User
 * @body    multipart/form-data: planId, upiId, transactionId, paymentProof (file), customerName, customerMobile
 */
endUserRouter.post(
  '/create',
  authenticate,
  ManualPaymentController.createManualSubscription // Middleware is in controller as array
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/panel/manual-payments/list
 * @desc    List subscriptions for manual verification with filters
 * @access  Super Admin
 * @query   status, search, dateFrom, dateTo, userId, planId, page, limit
 */
panelRouter.get(
  '/list',
  authenticate,
  allowRoles(['super_admin']),
  ManualPaymentController.listSubscriptionsForVerification
);

/**
 * @route   GET /api/panel/manual-payments/view/:id
 * @desc    Get single subscription for manual verification
 * @access  Super Admin
 */
panelRouter.get(
  '/view/:id',
  authenticate,
  allowRoles(['super_admin']),
  ManualPaymentController.getSubscriptionById
);

/**
 * @route   POST /api/panel/manual-payments/verify/:id
 * @desc    Verify or cancel manual payment
 * @access  Super Admin
 * @body    { approved: boolean, notes: string }
 */
panelRouter.post(
  '/verify/:id',
  authenticate,
  allowRoles(['super_admin']),
  ManualPaymentController.verifyManualPayment
);

/**
 * @route   POST /api/panel/manual-payments/qr-code
 * @desc    Store QR code for manual payments
 * @access  Super Admin
 * @body    multipart/form-data: qrCode (file)
 */
panelRouter.post(
  '/qr-code',
  authenticate,
  allowRoles(['super_admin']),
  ManualPaymentController.storeQRCode
);

// ==================== PUBLIC ROUTES ====================

const publicRouter = express.Router();

/**
 * @route   GET /api/public/manual-payments/qr-code
 * @desc    Get QR code for manual payments
 * @access  Public
 */
publicRouter.get(
  '/qr-code',
  ManualPaymentController.getQRCode
);

export { endUserRouter, panelRouter, publicRouter };
