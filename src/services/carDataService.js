/**
 * Car Data Service
 * Business logic for car brands, models, variants, and specifications
 */

import carBrandRepository from '#repositories/carBrandRepository.js';
import carModelRepository from '#repositories/carModelRepository.js';
import carVariantRepository from '#repositories/carVariantRepository.js';
import carSpecificationRepository from '#repositories/carSpecificationRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class CarDataService {
  // ==================== BRANDS ====================

  /**
   * Get all car brands for admin panel (flat list with all statuses)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getAllBrandsForAdmin(filters = {}) {
    const brands = await carBrandRepository.getAll(filters);

    return {
      success: true,
      message: 'Car brands retrieved successfully',
      data: brands
    };
  }

  /**
   * Get all car brands for public (grouped by popular and all, active only)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getAllBrandsForPublic(filters = {}) {
    // Force active only for public
    filters.isActive = true;
    
    const brands = await carBrandRepository.getAllGrouped(filters);

    return {
      success: true,
      message: 'Car brands retrieved successfully',
      data: brands
    };
  }

  /**
   * Get brand by ID
   * @param {number} id - Brand ID
   * @returns {Promise<Object>}
   */
  async getBrandById(id) {
    const brand = await carBrandRepository.getById(id);

    if (!brand) {
      throw new Error('Car brand not found');
    }

    return {
      success: true,
      message: 'Car brand retrieved successfully',
      data: brand
    };
  }

  /**
   * Create new brand
   * @param {Object} brandData - Brand data
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async createBrand(brandData, userId, userName) {
    // Validate required fields
    if (!brandData.name) {
      throw new Error('Brand name is required');
    }

    if (!brandData.slug) {
      throw new Error('Brand slug is required');
    }

    // Check if slug exists
    const slugExists = await carBrandRepository.slugExists(brandData.slug);
    if (slugExists) {
      throw new Error('Brand slug already exists');
    }

    brandData.createdBy = userId;

    const brand = await carBrandRepository.create(brandData);

    return {
      success: true,
      message: 'Car brand created successfully',
      data: brand
    };
  }

  /**
   * Update brand
   * @param {number} id - Brand ID
   * @param {Object} updateData - Update data
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async updateBrand(id, updateData, userId, userName) {
    const brand = await carBrandRepository.getById(id);

    if (!brand) {
      throw new Error('Car brand not found');
    }

    // Check slug uniqueness if updating
    if (updateData.slug) {
      const slugExists = await carBrandRepository.slugExists(updateData.slug, id);
      if (slugExists) {
        throw new Error('Brand slug already exists');
      }
    }

    const updatedBrand = await carBrandRepository.update(id, updateData, { userId, userName });

    return {
      success: true,
      message: 'Car brand updated successfully',
      data: updatedBrand
    };
  }

  /**
   * Update brand popular status
   * @param {number} id - Brand ID
   * @param {boolean} isPopular - Popular status
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async updateBrandPopularStatus(id, isPopular, userId, userName) {
    const brand = await carBrandRepository.getById(id);

    if (!brand) {
      throw new Error('Car brand not found');
    }

    const updatedBrand = await carBrandRepository.update(
      id,
      { isPopular },
      { userId, userName }
    );

    return {
      success: true,
      message: `Car brand ${isPopular ? 'marked as popular' : 'unmarked as popular'} successfully`,
      data: updatedBrand
    };
  }

  /**
   * Delete brand
   * @param {number} id - Brand ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async deleteBrand(id, userId) {
    const deleted = await carBrandRepository.delete(id, userId);

    if (!deleted) {
      throw new Error('Car brand not found');
    }

    return {
      success: true,
      message: 'Car brand deleted successfully',
      data: null
    };
  }

  // ==================== MODELS ====================

  /**
   * Get models by brand
   * @param {number} brandId - Brand ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getModelsByBrand(brandId, filters = {}) {
    const models = await carModelRepository.getByBrand(brandId, filters);

    return {
      success: true,
      message: 'Car models retrieved successfully',
      data: models
    };
  }

  /**
   * Get model by ID
   * @param {number} id - Model ID
   * @returns {Promise<Object>}
   */
  async getModelById(id) {
    const model = await carModelRepository.getById(id);

    if (!model) {
      throw new Error('Car model not found');
    }

    return {
      success: true,
      message: 'Car model retrieved successfully',
      data: model
    };
  }

  /**
   * Create new model
   * @param {Object} modelData - Model data
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async createModel(modelData, userId, userName) {
    if (!modelData.brandId) {
      throw new Error('Brand ID is required');
    }

    if (!modelData.name) {
      throw new Error('Model name is required');
    }

    if (!modelData.slug) {
      throw new Error('Model slug is required');
    }

    modelData.createdBy = userId;

    const model = await carModelRepository.create(modelData);

    return {
      success: true,
      message: 'Car model created successfully',
      data: model
    };
  }

  /**
   * Update model
   * @param {number} id - Model ID
   * @param {Object} updateData - Update data
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async updateModel(id, updateData, userId, userName) {
    const model = await carModelRepository.getById(id);

    if (!model) {
      throw new Error('Car model not found');
    }

    const updatedModel = await carModelRepository.update(id, updateData, { userId, userName });

    return {
      success: true,
      message: 'Car model updated successfully',
      data: updatedModel
    };
  }

  /**
   * Delete model
   * @param {number} id - Model ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async deleteModel(id, userId) {
    const deleted = await carModelRepository.delete(id, userId);

    if (!deleted) {
      throw new Error('Car model not found');
    }

    return {
      success: true,
      message: 'Car model deleted successfully',
      data: null
    };
  }

  // ==================== VARIANTS ====================

  /**
   * Get variants by model
   * @param {number} modelId - Model ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getVariantsByModel(modelId, filters = {}) {
    const variants = await carVariantRepository.getByModel(modelId, filters);

    return {
      success: true,
      message: 'Car variants retrieved successfully',
      data: variants
    };
  }

  /**
   * Get variant by ID
   * @param {number} id - Variant ID
   * @returns {Promise<Object>}
   */
  async getVariantById(id) {
    const variant = await carVariantRepository.getById(id);

    if (!variant) {
      throw new Error('Car variant not found');
    }

    return {
      success: true,
      message: 'Car variant retrieved successfully',
      data: variant
    };
  }

  /**
   * Create new variant
   * @param {Object} variantData - Variant data
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async createVariant(variantData, userId, userName) {
    if (!variantData.brandId) {
      throw new Error('Brand ID is required');
    }

    if (!variantData.modelId) {
      throw new Error('Model ID is required');
    }

    if (!variantData.variantName) {
      throw new Error('Variant name is required');
    }

    if (!variantData.slug) {
      throw new Error('Variant slug is required');
    }

    variantData.createdBy = userId;

    const variant = await carVariantRepository.create(variantData);

    return {
      success: true,
      message: 'Car variant created successfully',
      data: variant
    };
  }

  /**
   * Update variant
   * @param {number} id - Variant ID
   * @param {Object} updateData - Update data
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async updateVariant(id, updateData, userId, userName) {
    const variant = await carVariantRepository.getById(id);

    if (!variant) {
      throw new Error('Car variant not found');
    }

    const updatedVariant = await carVariantRepository.update(id, updateData, { userId, userName });

    return {
      success: true,
      message: 'Car variant updated successfully',
      data: updatedVariant
    };
  }

  /**
   * Delete variant
   * @param {number} id - Variant ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async deleteVariant(id, userId) {
    const deleted = await carVariantRepository.delete(id, userId);

    if (!deleted) {
      throw new Error('Car variant not found');
    }

    return {
      success: true,
      message: 'Car variant deleted successfully',
      data: null
    };
  }

  // ==================== SPECIFICATIONS ====================

  /**
   * Get specification by variant ID
   * @param {number} variantId - Variant ID
   * @returns {Promise<Object>}
   */
  async getSpecificationByVariantId(variantId) {
    const specification = await carSpecificationRepository.getByVariantId(variantId);

    if (!specification) {
      throw new Error('Car specification not found');
    }

    return {
      success: true,
      message: 'Car specification retrieved successfully',
      data: specification
    };
  }
}

// Export singleton instance
export default new CarDataService();
