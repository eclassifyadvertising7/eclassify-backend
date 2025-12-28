import carDataService from '#services/carDataService.js';
import { successResponse, errorResponse, createResponse } from '#utils/responseFormatter.js';

class CarDataController {
  static async getAllBrands(req, res) {
    try {
      const filters = {
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        isPopular: req.query.isPopular !== undefined ? req.query.isPopular === 'true' : undefined,
        search: req.query.search
      };

      const result = await carDataService.getAllBrandsForAdmin(filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getBrandById(req, res) {
    try {
      const { id } = req.params;

      const result = await carDataService.getBrandById(parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async createBrand(req, res) {
    try {
      const brandData = {
        name: req.body.name?.trim(),
        slug: req.body.slug?.trim(),
        nameLocal: req.body.nameLocal?.trim(),
        logoUrl: req.body.logoUrl?.trim(),
        description: req.body.description?.trim(),
        countryOfOrigin: req.body.countryOfOrigin?.trim(),
        displayOrder: req.body.displayOrder ? parseInt(req.body.displayOrder) : 0,
        isPopular: req.body.isPopular === 'true' || req.body.isPopular === true,
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true
      };

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await carDataService.createBrand(brandData, userId, userName);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateBrand(req, res) {
    try {
      const { id } = req.params;
      const updateData = {};

      if (req.body.name !== undefined) updateData.name = req.body.name.trim();
      if (req.body.slug !== undefined) updateData.slug = req.body.slug.trim();
      if (req.body.nameLocal !== undefined) updateData.nameLocal = req.body.nameLocal.trim();
      if (req.body.logoUrl !== undefined) updateData.logoUrl = req.body.logoUrl.trim();
      if (req.body.description !== undefined) updateData.description = req.body.description.trim();
      if (req.body.countryOfOrigin !== undefined) updateData.countryOfOrigin = req.body.countryOfOrigin.trim();
      if (req.body.displayOrder !== undefined) updateData.displayOrder = parseInt(req.body.displayOrder);
      if (req.body.isPopular !== undefined) updateData.isPopular = req.body.isPopular === 'true' || req.body.isPopular === true;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
      if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await carDataService.updateBrand(parseInt(id), updateData, userId, userName);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteBrand(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await carDataService.deleteBrand(parseInt(id), userId);
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
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        search: req.query.search
      };

      const result = await carDataService.getModelsByBrand(parseInt(brandId), filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getModelById(req, res) {
    try {
      const { id } = req.params;

      const result = await carDataService.getModelById(parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async createModel(req, res) {
    try {
      const modelData = {
        brandId: parseInt(req.body.brandId),
        name: req.body.name?.trim(),
        slug: req.body.slug?.trim(),
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        isDiscontinued: req.body.isDiscontinued === 'true' || req.body.isDiscontinued === true,
        launchYear: req.body.launchYear ? parseInt(req.body.launchYear) : null,
        discontinuationYear: req.body.discontinuationYear ? parseInt(req.body.discontinuationYear) : null
      };

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await carDataService.createModel(modelData, userId, userName);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateModel(req, res) {
    try {
      const { id } = req.params;
      const updateData = {};

      if (req.body.name !== undefined) updateData.name = req.body.name.trim();
      if (req.body.slug !== undefined) updateData.slug = req.body.slug.trim();
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
      if (req.body.isDiscontinued !== undefined) updateData.isDiscontinued = req.body.isDiscontinued === 'true' || req.body.isDiscontinued === true;
      if (req.body.launchYear !== undefined) updateData.launchYear = req.body.launchYear ? parseInt(req.body.launchYear) : null;
      if (req.body.discontinuationYear !== undefined) updateData.discontinuationYear = req.body.discontinuationYear ? parseInt(req.body.discontinuationYear) : null;

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await carDataService.updateModel(parseInt(id), updateData, userId, userName);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteModel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await carDataService.deleteModel(parseInt(id), userId);
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
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        search: req.query.search
      };

      const result = await carDataService.getVariantsByModel(parseInt(modelId), filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getVariantById(req, res) {
    try {
      const { id } = req.params;

      const result = await carDataService.getVariantById(parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async createVariant(req, res) {
    try {
      const variantData = {
        brandId: parseInt(req.body.brandId),
        modelId: parseInt(req.body.modelId),
        variantName: req.body.variantName?.trim(),
        slug: req.body.slug?.trim(),
        fullName: req.body.fullName?.trim(),
        modelYear: req.body.modelYear ? parseInt(req.body.modelYear) : null,
        bodyType: req.body.bodyType?.trim(),
        fuelType: req.body.fuelType?.trim(),
        transmissionType: req.body.transmissionType?.trim(),
        seatingCapacity: req.body.seatingCapacity ? parseInt(req.body.seatingCapacity) : null,
        doorCount: req.body.doorCount ? parseInt(req.body.doorCount) : null,
        exShowroomPrice: req.body.exShowroomPrice ? parseFloat(req.body.exShowroomPrice) : null,
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        isDiscontinued: req.body.isDiscontinued === 'true' || req.body.isDiscontinued === true
      };

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await carDataService.createVariant(variantData, userId, userName);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateVariant(req, res) {
    try {
      const { id } = req.params;
      const updateData = {};

      if (req.body.variantName !== undefined) updateData.variantName = req.body.variantName.trim();
      if (req.body.slug !== undefined) updateData.slug = req.body.slug.trim();
      if (req.body.fullName !== undefined) updateData.fullName = req.body.fullName.trim();
      if (req.body.modelYear !== undefined) updateData.modelYear = req.body.modelYear ? parseInt(req.body.modelYear) : null;
      if (req.body.bodyType !== undefined) updateData.bodyType = req.body.bodyType.trim();
      if (req.body.fuelType !== undefined) updateData.fuelType = req.body.fuelType.trim();
      if (req.body.transmissionType !== undefined) updateData.transmissionType = req.body.transmissionType.trim();
      if (req.body.seatingCapacity !== undefined) updateData.seatingCapacity = req.body.seatingCapacity ? parseInt(req.body.seatingCapacity) : null;
      if (req.body.doorCount !== undefined) updateData.doorCount = req.body.doorCount ? parseInt(req.body.doorCount) : null;
      if (req.body.exShowroomPrice !== undefined) updateData.exShowroomPrice = req.body.exShowroomPrice ? parseFloat(req.body.exShowroomPrice) : null;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
      if (req.body.isDiscontinued !== undefined) updateData.isDiscontinued = req.body.isDiscontinued === 'true' || req.body.isDiscontinued === true;

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await carDataService.updateVariant(parseInt(id), updateData, userId, userName);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteVariant(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await carDataService.deleteVariant(parseInt(id), userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default CarDataController;
