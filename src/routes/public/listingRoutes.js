/**
 * Public Listing Routes
 * Public endpoints for browsing listings
 */

import express from 'express';
import ListingController from '#controllers/public/listingController.js';

const router = express.Router();

// Get featured listings (action before slug to avoid conflicts)
router.get('/featured', ListingController.getFeatured);

// Increment view count (action before slug to avoid conflicts)
router.post('/view/:id', ListingController.incrementViewCount);

// Browse all active listings
router.get('/', ListingController.browse);

// Get listing by slug
router.get('/:slug', ListingController.getBySlug);

export default router;
