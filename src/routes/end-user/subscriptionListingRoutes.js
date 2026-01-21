import express from 'express';
import SubscriptionListingController from '#controllers/end-user/subscriptionListingController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user's listings for a specific subscription
router.get('/subscriptions/:subscriptionId/listings', SubscriptionListingController.getSubscriptionListings);

// Get summary of all user's subscriptions with listing counts
router.get('/subscriptions/summary', SubscriptionListingController.getSubscriptionSummary);

export default router;