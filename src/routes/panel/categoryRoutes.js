/**
 * Panel Category Routes
 * Admin/staff endpoints for category management
 */

import express from 'express';
import CategoryController from '#controllers/panel/categoryController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { uploadCategoryImages } from '#middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create category with optional image uploads (icon + image)
router.post('/', uploadCategoryImages, CategoryController.create);

// Get all categories (including inactive)
router.get('/', CategoryController.getAll);

// Update category status (action before ID to avoid conflicts)
router.patch('/status/:id', CategoryController.updateStatus);

// Update category featured status (action before ID to avoid conflicts)
router.patch('/featured/:id', CategoryController.updateFeaturedStatus);

// Get category by ID
router.get('/:id', CategoryController.getById);

// Update category with optional image uploads (icon + image)
router.put('/:id', uploadCategoryImages, CategoryController.update);

// Delete category
router.delete('/:id', CategoryController.delete);

export default router;
