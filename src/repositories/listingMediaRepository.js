/**
 * ListingMedia Repository
 * Handles database operations for listing media
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { ListingMedia } = models;

class ListingMediaRepository {
  /**
   * Create new media
   * @param {Object} mediaData - Media data
   * @returns {Promise<Object>}
   */
  async create(mediaData) {
    return await ListingMedia.create(mediaData);
  }

  /**
   * Create multiple media
   * @param {Array} mediaArray - Array of media data
   * @returns {Promise<Array>}
   */
  async createBulk(mediaArray) {
    return await ListingMedia.bulkCreate(mediaArray);
  }

  /**
   * Get media by ID
   * @param {number} id - Media ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await ListingMedia.findByPk(id);
  }

  /**
   * Get all media for a listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<Array>}
   */
  async getByListingId(listingId) {
    return await ListingMedia.findAll({
      where: { listingId },
      order: [['displayOrder', 'ASC']]
    });
  }

  /**
   * Get primary media for a listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object|null>}
   */
  async getPrimaryMedia(listingId) {
    return await ListingMedia.findOne({
      where: { listingId, isPrimary: true }
    });
  }

  /**
   * Count media by type for a listing
   * @param {number} listingId - Listing ID
   * @param {string} mediaType - Media type ('image' or 'video')
   * @returns {Promise<number>}
   */
  async countByType(listingId, mediaType) {
    return await ListingMedia.count({
      where: { listingId, mediaType }
    });
  }

  /**
   * Update media
   * @param {number} id - Media ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    const media = await ListingMedia.findByPk(id);
    if (!media) return null;

    await media.update(updateData);
    return media;
  }

  /**
   * Set primary media
   * @param {number} listingId - Listing ID
   * @param {number} mediaId - Media ID to set as primary
   * @returns {Promise<boolean>}
   */
  async setPrimary(listingId, mediaId) {
    // Remove primary flag from all media
    await ListingMedia.update(
      { isPrimary: false },
      { where: { listingId } }
    );

    // Set new primary
    const media = await ListingMedia.findOne({
      where: { id: mediaId, listingId }
    });

    if (!media) return false;

    await media.update({ isPrimary: true });
    return true;
  }

  /**
   * Update display order
   * @param {number} listingId - Listing ID
   * @param {Array} orderArray - Array of {id, displayOrder}
   * @returns {Promise<boolean>}
   */
  async updateDisplayOrder(listingId, orderArray) {
    const promises = orderArray.map(({ id, displayOrder }) =>
      ListingMedia.update(
        { displayOrder },
        { where: { id, listingId } }
      )
    );

    await Promise.all(promises);
    return true;
  }

  /**
   * Delete media
   * @param {number} id - Media ID
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    const media = await ListingMedia.findByPk(id);
    if (!media) return null;

    await media.destroy();
    return media;
  }

  /**
   * Delete all media for a listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<Array>}
   */
  async deleteByListingId(listingId) {
    const media = await ListingMedia.findAll({ where: { listingId } });
    await ListingMedia.destroy({ where: { listingId } });
    return media;
  }

  /**
   * Get next display order for a listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<number>}
   */
  async getNextDisplayOrder(listingId) {
    const maxOrder = await ListingMedia.max('displayOrder', {
      where: { listingId }
    });

    return (maxOrder || 0) + 1;
  }
}

// Export singleton instance
export default new ListingMediaRepository();
