/**
 * Public Car Data Controller
 * Handles public car data endpoints (brands, models, variants, specifications)
 */

import carDataService from '#services/carDataService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class CarDataController {
  /**
   * Get all car brands (grouped by featured and all, active only)
   * GET /api/public/car-brands
   */
  static async getAllBrands(req, res) {
    try {
      const filters = {
        search: req.query.search
      };

      const result = await carDataService.getAllBrandsForPublic(filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get car models by brand
   * GET /api/public/car-models
   */
  static async getModelsByBrand(req, res) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return errorResponse(res, 'Brand ID is required', 400);
      }

      const filters = {
        isActive: true,
        search: req.query.search
      };

      const result = await carDataService.getModelsByBrand(parseInt(brandId), filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get car variants by model
   * GET /api/public/car-variants
   */
  static async getVariantsByModel(req, res) {
    try {
      const { modelId } = req.query;

      if (!modelId) {
        return errorResponse(res, 'Model ID is required', 400);
      }

      const filters = {
        isActive: true,
        search: req.query.search
      };

      const result = await carDataService.getVariantsByModel(parseInt(modelId), filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get car specification by variant ID
   * GET /api/public/car-specifications/:variantId
   */
  static async getSpecificationByVariantId(req, res) {
    try {
      const { variantId } = req.params;

      const result = await carDataService.getSpecificationByVariantId(parseInt(variantId));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
}

export default CarDataController;
