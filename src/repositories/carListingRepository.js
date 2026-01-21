/**
 * CarListing Repository
 * Handles database operations for car listings
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { CarListing, CarBrand, CarModel, CarVariant, State } = models;

class CarListingRepository {
  async create(carData) {
    const enrichedData = { ...carData };

    if (carData.brandId) {
      const brand = await CarBrand.findByPk(carData.brandId);
      if (brand) {
        enrichedData.brandName = brand.name;
      }
    }

    if (carData.modelId) {
      const model = await CarModel.findByPk(carData.modelId);
      if (model) {
        enrichedData.modelName = model.name;
      }
    }

    if (carData.variantId) {
      const variant = await CarVariant.findByPk(carData.variantId);
      if (variant) {
        enrichedData.variantName = variant.variantName;
      }
    }

    return await CarListing.create(enrichedData);
  }

  /**
   * Get car listing by listing ID
   * @param {number} listingId - Listing ID
   * @param {boolean} includeRelations - Include related data
   * @returns {Promise<Object|null>}
   */
  async getByListingId(listingId, includeRelations = false) {
    const include = includeRelations ? [
      { model: CarBrand, as: 'brand', attributes: ['id', 'name', 'slug'] },
      { model: CarModel, as: 'model', attributes: ['id', 'name', 'slug'] },
      { model: CarVariant, as: 'variant', attributes: ['id', 'variantName', 'slug'] },
      { model: State, as: 'registrationState', attributes: ['id', 'name', 'slug'] }
    ] : [];

    return await CarListing.findOne({
      where: { listingId },
      include
    });
  }

  async update(listingId, updateData) {
    const carListing = await CarListing.findOne({ where: { listingId } });
    if (!carListing) return null;

    const enrichedData = { ...updateData };

    if (updateData.brandId) {
      const brand = await CarBrand.findByPk(updateData.brandId);
      if (brand) {
        enrichedData.brandName = brand.name;
      }
    }

    if (updateData.modelId) {
      const model = await CarModel.findByPk(updateData.modelId);
      if (model) {
        enrichedData.modelName = model.name;
      }
    }

    if (updateData.variantId) {
      const variant = await CarVariant.findByPk(updateData.variantId);
      if (variant) {
        enrichedData.variantName = variant.variantName;
      }
    } else if (updateData.variantId === null) {
      enrichedData.variantName = null;
    }

    await carListing.update(enrichedData);
    return carListing;
  }

  /**
   * Delete car listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<boolean>}
   */
  async delete(listingId) {
    const result = await CarListing.destroy({ where: { listingId } });
    return result > 0;
  }

  /**
   * Search car listings with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async search(filters = {}) {
    const where = {};

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.modelId) {
      where.modelId = filters.modelId;
    }

    if (filters.variantId) {
      where.variantId = filters.variantId;
    }

    if (filters.minYear || filters.maxYear) {
      where.year = {};
      if (filters.minYear) where.year[Op.gte] = filters.minYear;
      if (filters.maxYear) where.year[Op.lte] = filters.maxYear;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.fuelType) {
      where.fuelType = filters.fuelType;
    }

    if (filters.transmission) {
      where.transmission = filters.transmission;
    }

    if (filters.bodyType) {
      where.bodyType = filters.bodyType;
    }

    if (filters.maxMileage) {
      where.mileageKm = { [Op.lte]: filters.maxMileage };
    }

    return await CarListing.findAll({
      where,
      include: [
        { model: CarBrand, as: 'brand', attributes: ['id', 'name', 'slug'] },
        { model: CarModel, as: 'model', attributes: ['id', 'name', 'slug'] }
      ]
    });
  }
}

// Export singleton instance
export default new CarListingRepository();
