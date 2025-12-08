import express from 'express';
import SubscriptionPlanController from '#controllers/public/subscriptionPlanController.js';

const router = express.Router();

/**
 * @route   GET /api/public/subscription-plans
 * @desc    Get all active and visible subscription plans
 * @access  Public
 */
router.get('/', SubscriptionPlanController.getAvailablePlans);

/**
 * @route   GET /api/public/subscription-plans/:id
 * @desc    Get subscription plan details by ID
 * @access  Public
 */
router.get('/:id', SubscriptionPlanController.getPlanById);

export default router;
