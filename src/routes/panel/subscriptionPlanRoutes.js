import express from 'express';
import SubscriptionPlanController from '#controllers/panel/subscriptionPlanController.js';
import { authenticate, authorize } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and super_admin role
router.use(authenticate);
router.use(authorize(['super_admin']));

/**
 * @route   POST /api/panel/subscription-plans
 * @desc    Create new subscription plan
 * @access  Super Admin
 */
router.post('/', SubscriptionPlanController.createPlan);

/**
 * @route   PUT /api/panel/subscription-plans/:id
 * @desc    Update subscription plan (auto-detects version need)
 * @access  Super Admin
 */
router.put('/:id', SubscriptionPlanController.updatePlan);

/**
 * @route   GET /api/panel/subscription-plans
 * @desc    Get all plans (admin view)
 * @access  Super Admin
 */
router.get('/', SubscriptionPlanController.getAllPlans);

/**
 * @route   GET /api/panel/subscription-plans/:id
 * @desc    Get plan by ID
 * @access  Super Admin
 */
router.get('/:id', SubscriptionPlanController.getPlanById);

/**
 * @route   DELETE /api/panel/subscription-plans/:id
 * @desc    Delete plan (soft delete)
 * @access  Super Admin
 */
router.delete('/:id', SubscriptionPlanController.deletePlan);

/**
 * @route   PATCH /api/panel/subscription-plans/status/:id
 * @desc    Update plan status
 * @access  Super Admin
 */
router.patch('/status/:id', SubscriptionPlanController.updateStatus);

/**
 * @route   PATCH /api/panel/subscription-plans/visibility/:id
 * @desc    Update plan visibility
 * @access  Super Admin
 */
router.patch('/visibility/:id', SubscriptionPlanController.updateVisibility);

export default router;
