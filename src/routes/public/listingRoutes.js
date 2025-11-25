/**
 * Public Listing Routes
 * Public endpoints for browsing listings
 */

import express from 'express';
import ListingController from '#controllers/public/listingController.js';

const router = express.Router();

// Homepage listings (action before slug to avoid conflicts)
router.get('/homepage', ListingController.homepage);

// Get featured listings (action before slug to avoid conflicts)
router.get('/featured', ListingController.getFeatured);

// Browse category listings with filters (action before slug to avoid conflicts)
router.get('/category/:categorySlugOrId', ListingController.browseByCategory);

// Increment view count (action before slug to avoid conflicts)
router.post('/view/:id', ListingController.incrementViewCount);

// Browse all active listings (legacy - kept for backward compatibility)
router.get('/', ListingController.browse);

// Get listing by slug
router.get('/:slug', ListingController.getBySlug);

export default router;
