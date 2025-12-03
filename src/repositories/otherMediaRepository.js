/**
 * OtherMedia Repository
 * Handles database operations for other media (QR codes, etc.)
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { OtherMedia } = models;

class OtherMediaRepository {
  /**
   * Create new media
   * @param {Object} mediaData - Media data
   * @returns {Promise<Object>}
   */
  async create(mediaData) {
    return await OtherMedia.create(mediaData);
  }

  /**
   * Get media by ID
   * @param {number} id - Media ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await OtherMedia.findByPk(id);
  }

  /**
   * Get media by identifier slug
   * @param {string} identifierSlug - Identifier slug (e.g., 'manual-payment-qr')
   * @returns {Promise<Object|null>}
   */
  async getByIdentifierSlug(identifierSlug) {
    return await OtherMedia.findOne({
      where: { identifierSlug },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get all media by identifier slug
   * @param {string} identifierSlug - Identifier slug
   * @returns {Promise<Array>}
   */
  async getAllByIdentifierSlug(identifierSlug) {
    return await OtherMedia.findAll({
      where: { identifierSlug },
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Update media
   * @param {number} id - Media ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    const media = await OtherMedia.findByPk(id);
    if (!media) return null;

    await media.update(updateData);
    return media;
  }

  /**
   * Delete media
   * @param {number} id - Media ID
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    const media = await OtherMedia.findByPk(id);
    if (!media) return null;

    await media.destroy();
    return media;
  }

  /**
   * Delete by identifier slug
   * @param {string} identifierSlug - Identifier slug
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteByIdentifierSlug(identifierSlug) {
    return await OtherMedia.destroy({
      where: { identifierSlug }
    });
  }

  /**
   * Check if media exists by identifier slug
   * @param {string} identifierSlug - Identifier slug
   * @returns {Promise<boolean>}
   */
  async existsByIdentifierSlug(identifierSlug) {
    const count = await OtherMedia.count({
      where: { identifierSlug }
    });
    return count > 0;
  }
}

// Export singleton instance
export default new OtherMediaRepository();
