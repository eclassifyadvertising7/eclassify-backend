/**
 * Panel Car Data Routes
 * Admin endpoints for car data management
 */

import express from 'express';
import CarDataController from '#controllers/panel/carDataController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== BRANDS ====================

// Get all brands
router.get('/car-brands', CarDataController.getAllBrands);

// Get brand by ID
router.get('/car-brands/:id', CarDataController.getBrandById);

// Create brand
router.post('/car-brands', CarDataController.createBrand);

// Update brand
router.put('/car-brands/:id', CarDataController.updateBrand);

// Delete brand
router.delete('/car-brands/:id', CarDataController.deleteBrand);

// ==================== MODELS ====================

// Get models by brand
router.get('/car-models', CarDataController.getModelsByBrand);

// Get model by ID
router.get('/car-models/:id', CarDataController.getModelById);

// Create model
router.post('/car-models', CarDataController.createModel);

// Update model
router.put('/car-models/:id', CarDataController.updateModel);

// Delete model
router.delete('/car-models/:id', CarDataController.deleteModel);

// ==================== VARIANTS ====================

// Get variants by model
router.get('/car-variants', CarDataController.getVariantsByModel);

// Get variant by ID
router.get('/car-variants/:id', CarDataController.getVariantById);

// Create variant
router.post('/car-variants', CarDataController.createVariant);

// Update variant
router.put('/car-variants/:id', CarDataController.updateVariant);

// Delete variant
router.delete('/car-variants/:id', CarDataController.deleteVariant);

export default router;
