/**
 * ListingMedia Repository
 * Handles database operations for listing media
 */

import models from '#models/index.js';

const { ListingMedia, Listing } = models;

class ListingMediaRepository {
  /**
   * Create new media
   * @param {Object} mediaData - Media data
   * @returns {Promise<Object>}
   */
  async create(mediaData) {
    const media = await ListingMedia.create(mediaData);

    if (mediaData.isPrimary) {
      await Listing.update(
        {
          coverImage: media.getDataValue('mediaUrl'),
          coverImageStorageType: media.storageType,
          coverImageMimeType: media.mimeType
        },
        { where: { id: mediaData.listingId } }
      );
    }

    return media;
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

    await Listing.update(
      {
        coverImage: media.getDataValue('mediaUrl'),
        coverImageStorageType: media.storageType,
        coverImageMimeType: media.mimeType
      },
      { where: { id: listingId } }
    );

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

    const wasPrimary = media.isPrimary;
    const listingId = media.listingId;

    await media.destroy();

    if (wasPrimary) {
      const newPrimary = await ListingMedia.findOne({
        where: { listingId },
        order: [['displayOrder', 'ASC']]
      });

      if (newPrimary) {
        await Listing.update(
          {
            coverImage: newPrimary.getDataValue('mediaUrl'),
            coverImageStorageType: newPrimary.storageType,
            coverImageMimeType: newPrimary.mimeType
          },
          { where: { id: listingId } }
        );
      } else {
        await Listing.update(
          {
            coverImage: null,
            coverImageStorageType: null,
            coverImageMimeType: null
          },
          { where: { id: listingId } }
        );
      }
    }

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

    await Listing.update(
      {
        coverImage: null,
        coverImageStorageType: null,
        coverImageMimeType: null
      },
      { where: { id: listingId } }
    );

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

  /**
   * Get listing by ID (for folder organization)
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object|null>}
   */
  async getListingById(listingId) {
    return await Listing.findByPk(listingId, {
      attributes: ['id', 'userId']
    });
  }
}

// Export singleton instance
export default new ListingMediaRepository();
