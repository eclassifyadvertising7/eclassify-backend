/**
 * Public Listing Routes
 * Public endpoints for browsing listings
 */

import express from 'express';
import ListingController from '#controllers/public/listingController.js';
import { optionalAuthenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// Homepage listings with category filtering (action before slug to avoid conflicts)
router.get('/homepage', optionalAuthenticate, ListingController.getHomepageListings);

// Get featured listings (action before slug to avoid conflicts)
router.get('/featured', optionalAuthenticate, ListingController.getFeatured);

// Search listings (action before slug to avoid conflicts)
router.get('/search', optionalAuthenticate, ListingController.searchListings);

// Search suggestions (action before slug to avoid conflicts)
router.get('/search/suggestions', optionalAuthenticate, ListingController.getSearchSuggestions);

// Search filters (action before slug to avoid conflicts)
router.get('/search/filters/:categoryId?', optionalAuthenticate, ListingController.getSearchFilters);

// Browse category listings with filters (action before slug to avoid conflicts)
router.get('/category/:categorySlugOrId', optionalAuthenticate, ListingController.browseByCategory);

// Get similar listings (action before slug to avoid conflicts)
router.get('/:id/similar', optionalAuthenticate, ListingController.getSimilarListings);

// Get related listings (action before slug to avoid conflicts)
router.get('/related/:id', optionalAuthenticate, ListingController.getRelatedListings);

// Increment view count (action before slug to avoid conflicts)
// Optional auth: if authenticated, checks if user is owner or super_admin
router.post('/view/:id', optionalAuthenticate, ListingController.incrementViewCount);

// Get listing by share code (action before slug to avoid conflicts)
router.get('/share/:shareCode', optionalAuthenticate, ListingController.getByShareCode);

// Browse all active listings (legacy - kept for backward compatibility)
router.get('/', optionalAuthenticate, ListingController.browse);

// Get listing by slug (must be last to avoid conflicts with actions)
router.get('/:slug', optionalAuthenticate, ListingController.getBySlug);

export default router;
