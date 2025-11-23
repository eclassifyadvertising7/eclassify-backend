/**
 * CarBrand Repository
 * Handles database operations for car brands
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { CarBrand } = models;

class CarBrandRepository {
  /**
   * Get all car brands (for admin panel - includes all fields and statuses)
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isPopular !== undefined) {
      where.isPopular = filters.isPopular;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { slug: { [Op.iLike]: `%${filters.search}%` } },
        { nameLocal: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    return await CarBrand.findAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC']
      ],
      attributes: [
        'id',
        'name',
        'slug',
        'nameLocal',
        'logoUrl',
        'description',
        'countryOfOrigin',
        'displayOrder',
        'isPopular',
        'isActive',
        'isFeatured',
        'totalModels',
        'createdAt',
        'updatedAt'
      ]
    });
  }

  /**
   * Get brands grouped by featured and all (for public use)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getAllGrouped(filters = {}) {
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.name = { [Op.iLike]: `%${filters.search}%` };
    }

    // Get featured brands
    const featured = await CarBrand.findAll({
      where: { ...where, isFeatured: true },
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC']
      ],
      attributes: ['id', 'name', 'slug', 'logoUrl', 'isPopular', 'isFeatured', 'totalModels']
    });

    // Get all brands in alphabetical order
    const all = await CarBrand.findAll({
      where,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'logoUrl', 'isPopular', 'isFeatured', 'totalModels']
    });

    return {
      featured,
      all
    };
  }

  /**
   * Get brand by ID
   * @param {number} id - Brand ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await CarBrand.findByPk(id);
  }

  /**
   * Get brand by slug
   * @param {string} slug - Brand slug
   * @returns {Promise<Object|null>}
   */
  async getBySlug(slug) {
    return await CarBrand.findOne({ where: { slug } });
  }

  /**
   * Create new brand
   * @param {Object} brandData - Brand data
   * @returns {Promise<Object>}
   */
  async create(brandData) {
    return await CarBrand.create(brandData);
  }

  /**
   * Update brand
   * @param {number} id - Brand ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData, options = {}) {
    const brand = await CarBrand.findByPk(id);
    if (!brand) return null;

    await brand.update(updateData, options);
    return brand;
  }

  /**
   * Delete brand
   * @param {number} id - Brand ID
   * @param {number} deletedBy - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id, deletedBy) {
    const brand = await CarBrand.findByPk(id);
    if (!brand) return false;

    await brand.update({ deletedBy });
    await brand.destroy();
    return true;
  }

  /**
   * Check if slug exists
   * @param {string} slug - Brand slug
   * @param {number} excludeId - Exclude this ID
   * @returns {Promise<boolean>}
   */
  async slugExists(slug, excludeId = null) {
    const where = { slug };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const count = await CarBrand.count({ where });
    return count > 0;
  }
}

// Export singleton instance
export default new CarBrandRepository();
