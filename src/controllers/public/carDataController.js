import carDataService from '#services/carDataService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class CarDataController {
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
