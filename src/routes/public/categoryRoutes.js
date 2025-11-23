/**
 * Public Category Routes
 * Public endpoints for browsing categories (no authentication required)
 */

import express from 'express';
import PublicCategoryController from '#controllers/public/categoryController.js';

const router = express.Router();

// Get all active categories
router.get('/', PublicCategoryController.getAll);

// Get category by slug
router.get('/:slug', PublicCategoryController.getBySlug);

export default router;
