/**
 * Public Car Data Routes
 * Public endpoints for car brands, models, variants, and specifications
 */

import express from 'express';
import CarDataController from '#controllers/public/carDataController.js';

const router = express.Router();

// Get all car brands
router.get('/car-brands', CarDataController.getAllBrands);

// Get car models by brand
router.get('/car-models', CarDataController.getModelsByBrand);

// Get car variants by model
router.get('/car-variants', CarDataController.getVariantsByModel);

// Get car specification by variant ID
router.get('/car-specifications/:variantId', CarDataController.getSpecificationByVariantId);

export default router;
