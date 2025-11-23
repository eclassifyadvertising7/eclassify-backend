/**
 * Panel Listing Routes
 * Admin/staff endpoints for listing management
 */

import express from 'express';
import ListingController from '#controllers/panel/listingController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get listing statistics (action before ID to avoid conflicts)
router.get('/stats', ListingController.getStats);

// Approve listing (action before ID to avoid conflicts)
router.patch('/approve/:id', ListingController.approve);

// Reject listing (action before ID to avoid conflicts)
router.patch('/reject/:id', ListingController.reject);

// Update featured status (action before ID to avoid conflicts)
router.patch('/featured/:id', ListingController.updateFeaturedStatus);

// Get all listings
router.get('/', ListingController.getAll);

// Get listing by ID
router.get('/:id', ListingController.getById);

// Delete listing
router.delete('/:id', ListingController.delete);

export default router;
