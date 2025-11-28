/**
 * End-User Listing Routes
 * User's own listing management endpoints
 */

import express from 'express';
import ListingController from '#controllers/end-user/listingController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { uploadListingMedia } from '#middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get personalized feed (action before ID to avoid conflicts)
router.get('/feed', ListingController.getFeed);

// Get my listing statistics (action before ID to avoid conflicts)
router.get('/stats', ListingController.getMyStats);

// Submit listing for approval (action before ID to avoid conflicts)
router.post('/submit/:id', ListingController.submit);

// Mark listing as sold (action before ID to avoid conflicts)
router.patch('/sold/:id', ListingController.markAsSold);

// Upload media for listing (action before ID to avoid conflicts)
router.post('/media/:id', uploadListingMedia, ListingController.uploadMedia);

// Delete media from listing (action before ID to avoid conflicts)
router.delete('/delete-media/:id/media/:mediaId', ListingController.deleteMedia);

// Create new listing
router.post('/', ListingController.create);

// Get my listings
router.get('/', ListingController.getMyListings);

// Get my listing by ID
router.get('/:id', ListingController.getById);

// Update my listing
router.put('/:id', ListingController.update);

// Delete my listing
router.delete('/:id', ListingController.delete);

export default router;
