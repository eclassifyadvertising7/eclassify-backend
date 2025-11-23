/**
 * Category Repository
 * Handles database operations for categories
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { Category } = models;

class CategoryRepository {
  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>}
   */
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * Get all categories with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { slug: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    return await Category.findAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC']
      ]
    });
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await Category.findByPk(id);
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object|null>}
   */
  async getBySlug(slug) {
    return await Category.findOne({
      where: { slug }
    });
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Additional options (userId, userName for audit)
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData, options = {}) {
    const category = await Category.findByPk(id);
    if (!category) return null;

    // Handle updated_by audit trail
    if (options.userId && options.userName) {
      const currentUpdates = category.updatedBy || [];
      updateData.updatedBy = [
        ...currentUpdates,
        {
          userId: options.userId,
          userName: options.userName,
          timestamp: new Date().toISOString()
        }
      ];
    }

    await category.update(updateData);
    return category;
  }

  /**
   * Update category status (active/inactive)
   * @param {number} id - Category ID
   * @param {boolean} isActive - Active status
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>}
   */
  async updateStatus(id, isActive, options = {}) {
    return await this.update(id, { isActive }, options);
  }

  /**
   * Update category featured status
   * @param {number} id - Category ID
   * @param {boolean} isFeatured - Featured status
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>}
   */
  async updateFeaturedStatus(id, isFeatured, options = {}) {
    return await this.update(id, { isFeatured }, options);
  }

  /**
   * Soft delete category
   * @param {number} id - Category ID
   * @param {number} deletedBy - User ID who deleted
   * @returns {Promise<boolean>}
   */
  async delete(id, deletedBy) {
    const category = await Category.findByPk(id);
    if (!category) return false;

    await category.update({ deletedBy });
    await category.destroy();
    return true;
  }

  /**
   * Check if slug exists
   * @param {string} slug - Category slug
   * @param {number} excludeId - Exclude this ID from check (for updates)
   * @returns {Promise<boolean>}
   */
  async slugExists(slug, excludeId = null) {
    const where = { slug };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const count = await Category.count({ where });
    return count > 0;
  }

  /**
   * Check if name exists
   * @param {string} name - Category name
   * @param {number} excludeId - Exclude this ID from check (for updates)
   * @returns {Promise<boolean>}
   */
  async nameExists(name, excludeId = null) {
    const where = { name };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const count = await Category.count({ where });
    return count > 0;
  }
}

// Export singleton instance
export default new CategoryRepository();
