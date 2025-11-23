/**
 * CarModel Repository
 * Handles database operations for car models
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { CarModel, CarBrand } = models;

class CarModelRepository {
  /**
   * Get all models by brand
   * @param {number} brandId - Brand ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getByBrand(brandId, filters = {}) {
    const where = { brandId };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.name = { [Op.iLike]: `%${filters.search}%` };
    }

    return await CarModel.findAll({
      where,
      include: [
        {
          model: CarBrand,
          as: 'brand',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['name', 'ASC']],
      attributes: ['id', 'brandId', 'name', 'slug', 'launchYear', 'isDiscontinued', 'totalVariants']
    });
  }

  /**
   * Get model by ID
   * @param {number} id - Model ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await CarModel.findByPk(id, {
      include: [
        {
          model: CarBrand,
          as: 'brand',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  /**
   * Create new model
   * @param {Object} modelData - Model data
   * @returns {Promise<Object>}
   */
  async create(modelData) {
    return await CarModel.create(modelData);
  }

  /**
   * Update model
   * @param {number} id - Model ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData, options = {}) {
    const model = await CarModel.findByPk(id);
    if (!model) return null;

    await model.update(updateData, options);
    return model;
  }

  /**
   * Delete model
   * @param {number} id - Model ID
   * @param {number} deletedBy - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id, deletedBy) {
    const model = await CarModel.findByPk(id);
    if (!model) return false;

    await model.update({ deletedBy });
    await model.destroy();
    return true;
  }
}

// Export singleton instance
export default new CarModelRepository();
