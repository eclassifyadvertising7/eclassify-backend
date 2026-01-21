/**
 * PropertyListing Repository
 * Handles database operations for property listings
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { PropertyListing } = models;

class PropertyListingRepository {
  /**
   * Create new property listing
   * @param {Object} propertyData - Property listing data
   * @returns {Promise<Object>}
   */
  async create(propertyData) {
    return await PropertyListing.create(propertyData);
  }

  /**
   * Get property listing by listing ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object|null>}
   */
  async getByListingId(listingId) {
    return await PropertyListing.findOne({
      where: { listingId }
    });
  }

  /**
   * Update property listing
   * @param {number} listingId - Listing ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>}
   */
  async update(listingId, updateData) {
    const propertyListing = await PropertyListing.findOne({ where: { listingId } });
    if (!propertyListing) return null;

    await propertyListing.update(updateData);
    return propertyListing;
  }

  /**
   * Delete property listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<boolean>}
   */
  async delete(listingId) {
    const result = await PropertyListing.destroy({ where: { listingId } });
    return result > 0;
  }

  /**
   * Search property listings with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async search(filters = {}) {
    const where = {};

    if (filters.propertyType) {
      where.propertyType = filters.propertyType;
    }

    if (filters.listingType) {
      where.listingType = filters.listingType;
    }

    if (filters.minBedrooms || filters.maxBedrooms) {
      where.bedrooms = {};
      if (filters.minBedrooms) where.bedrooms[Op.gte] = filters.minBedrooms;
      if (filters.maxBedrooms) where.bedrooms[Op.lte] = filters.maxBedrooms;
    }

    if (filters.unitType) {
      where.unitType = filters.unitType;
    }

    if (filters.minArea || filters.maxArea) {
      where.areaSqft = {};
      if (filters.minArea) where.areaSqft[Op.gte] = filters.minArea;
      if (filters.maxArea) where.areaSqft[Op.lte] = filters.maxArea;
    }

    if (filters.furnished) {
      where.furnished = filters.furnished;
    }

    if (filters.facing) {
      where.facing = filters.facing;
    }

    return await PropertyListing.findAll({ where });
  }
}

// Export singleton instance
export default new PropertyListingRepository();
