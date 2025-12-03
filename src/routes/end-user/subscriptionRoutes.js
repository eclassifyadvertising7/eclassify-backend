import express from 'express';
import SubscriptionController from '#controllers/end-user/subscriptionController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/end-user/subscriptions/plans
 * @desc    Get available plans for end users
 * @access  Authenticated Users
 */
router.get('/plans', SubscriptionController.getAvailablePlans);

/**
 * @route   GET /api/end-user/subscriptions/plans/:id
 * @desc    Get plan details
 * @access  Authenticated Users
 */
router.get('/plans/:id', SubscriptionController.getPlanDetails);

/**
 * @route   GET /api/end-user/subscriptions/active
 * @desc    Get user's active subscription
 * @access  Authenticated Users
 */
router.get('/active', SubscriptionController.getMySubscription);

/**
 * @route   GET /api/end-user/subscriptions/history
 * @desc    Get user's subscription history
 * @access  Authenticated Users
 */
router.get('/history', SubscriptionController.getSubscriptionHistory);

/**
 * @route   GET /api/end-user/subscriptions
 * @desc    Get all my subscriptions (with filters)
 * @access  Authenticated Users
 */
router.get('/', SubscriptionController.getMySubscriptions);

/**
 * @route   GET /api/end-user/subscriptions/:id
 * @desc    Get my subscription by ID
 * @access  Authenticated Users
 */
router.get('/:id', SubscriptionController.getMySubscriptionById);

/**
 * @route   POST /api/end-user/subscriptions
 * @desc    Subscribe to plan
 * @access  Authenticated Users
 */
router.post('/', SubscriptionController.subscribeToPlan);

/**
 * @route   POST /api/end-user/subscriptions/:id/cancel
 * @desc    Cancel subscription
 * @access  Authenticated Users
 */
router.post('/:id/cancel', SubscriptionController.cancelSubscription);

export default router;
