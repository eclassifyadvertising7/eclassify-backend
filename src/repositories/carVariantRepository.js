/**
 * CarVariant Repository
 * Handles database operations for car variants
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { CarVariant, CarBrand, CarModel, CarSpecification } = models;

class CarVariantRepository {
  /**
   * Get all variants by model
   * @param {number} modelId - Model ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getByModel(modelId, filters = {}) {
    const where = { modelId };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.variantName = { [Op.iLike]: `%${filters.search}%` };
    }

    return await CarVariant.findAll({
      where,
      include: [
        {
          model: CarBrand,
          as: 'brand',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: CarModel,
          as: 'model',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['variantName', 'ASC']],
      attributes: ['id', 'brandId', 'modelId', 'variantName', 'slug', 'fuelType', 'transmissionType', 'exShowroomPrice']
    });
  }

  /**
   * Get variant by ID
   * @param {number} id - Variant ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await CarVariant.findByPk(id, {
      include: [
        {
          model: CarBrand,
          as: 'brand',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: CarModel,
          as: 'model',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: CarSpecification,
          as: 'specification'
        }
      ]
    });
  }

  /**
   * Create new variant
   * @param {Object} variantData - Variant data
   * @returns {Promise<Object>}
   */
  async create(variantData) {
    return await CarVariant.create(variantData);
  }

  /**
   * Update variant
   * @param {number} id - Variant ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData, options = {}) {
    const variant = await CarVariant.findByPk(id);
    if (!variant) return null;

    await variant.update(updateData, options);
    return variant;
  }

  /**
   * Delete variant
   * @param {number} id - Variant ID
   * @param {number} deletedBy - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id, deletedBy) {
    const variant = await CarVariant.findByPk(id);
    if (!variant) return false;

    await variant.update({ deletedBy });
    await variant.destroy();
    return true;
  }
}

// Export singleton instance
export default new CarVariantRepository();
