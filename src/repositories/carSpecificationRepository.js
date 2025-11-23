/**
 * CarSpecification Repository
 * Handles database operations for car specifications
 */

import models from '#models/index.js';

const { CarSpecification } = models;

class CarSpecificationRepository {
  /**
   * Get specification by variant ID
   * @param {number} variantId - Variant ID
   * @returns {Promise<Object|null>}
   */
  async getByVariantId(variantId) {
    return await CarSpecification.findOne({
      where: { variantId }
    });
  }

  /**
   * Get specification by ID
   * @param {number} id - Specification ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await CarSpecification.findByPk(id);
  }

  /**
   * Create new specification
   * @param {Object} specData - Specification data
   * @returns {Promise<Object>}
   */
  async create(specData) {
    return await CarSpecification.create(specData);
  }

  /**
   * Update specification
   * @param {number} id - Specification ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData, options = {}) {
    const spec = await CarSpecification.findByPk(id);
    if (!spec) return null;

    await spec.update(updateData, options);
    return spec;
  }

  /**
   * Delete specification
   * @param {number} id - Specification ID
   * @param {number} deletedBy - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id, deletedBy) {
    const spec = await CarSpecification.findByPk(id);
    if (!spec) return false;

    await spec.update({ deletedBy });
    await spec.destroy();
    return true;
  }
}

// Export singleton instance
export default new CarSpecificationRepository();
