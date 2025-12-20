import express from 'express';
import SubscriptionController from '#controllers/panel/subscriptionController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication and super admin role check to all routes
router.use(authenticate);
router.use(allowRoles(['super_admin']));

/**
 * @route   GET /api/panel/subscriptions
 * @desc    Get all user subscriptions with filters
 * @access  Super Admin
 * @query   status, userId, planId, dateFrom, dateTo, page, limit
 */
router.get('/', SubscriptionController.getAllSubscriptions);

/**
 * @route   GET /api/panel/subscriptions/category/:categoryId
 * @desc    Get subscriptions by category
 * @access  Super Admin
 * @query   status, userId, search, page, limit
 */
router.get('/category/:categoryId', SubscriptionController.getSubscriptionsByCategory);

/**
 * @route   GET /api/panel/subscriptions/:id
 * @desc    Get subscription by ID
 * @access  Super Admin
 */
router.get('/:id', SubscriptionController.getSubscriptionById);

/**
 * @route   POST /api/panel/subscriptions
 * @desc    Create subscription manually (assign plan to user)
 * @access  Super Admin
 */
router.post('/', SubscriptionController.createSubscription);

/**
 * @route   PUT /api/panel/subscriptions/:id
 * @desc    Update subscription
 * @access  Super Admin
 */
router.put('/:id', SubscriptionController.updateSubscription);

/**
 * @route   DELETE /api/panel/subscriptions/:id
 * @desc    Delete subscription (soft delete)
 * @access  Super Admin
 */
router.delete('/:id', SubscriptionController.deleteSubscription);

/**
 * @route   PATCH /api/panel/subscriptions/status/:id
 * @desc    Update subscription status
 * @access  Super Admin
 */
router.patch('/status/:id', SubscriptionController.updateSubscriptionStatus);

/**
 * @route   POST /api/panel/subscriptions/:id/extend
 * @desc    Extend subscription by days
 * @access  Super Admin
 */
router.post('/:id/extend', SubscriptionController.extendSubscription);

export default router;
