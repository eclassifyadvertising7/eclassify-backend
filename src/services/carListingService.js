/**
 * CarListing Service
 * Business logic for car-specific listing operations
 */

import carListingRepository from '#repositories/carListingRepository.js';

class CarListingService {
  /**
   * Validate car listing data
   * @param {Object} carData - Car listing data
   * @private
   */
  _validateCarData(carData) {
    if (!carData.brandId) {
      throw new Error('Car brand is required');
    }

    if (!carData.modelId) {
      throw new Error('Car model is required');
    }

    if (!carData.registrationYear) {
      throw new Error('Registration year is required');
    }

    if (carData.mileageKm && carData.mileageKm < 0) {
      throw new Error('Mileage cannot be negative');
    }

    if (!carData.fuelType) {
      throw new Error('Fuel type is required');
    }

    if (!carData.transmission) {
      throw new Error('Transmission type is required');
    }

    if (carData.ownersCount && carData.ownersCount < 1) {
      throw new Error('Owners count must be at least 1');
    }

    if (carData.seats && (carData.seats < 2 || carData.seats > 20)) {
      throw new Error('Seats must be between 2 and 20');
    }
  }

  /**
   * Prepare car data for creation/update
   * @param {Object} carData - Raw car data
   * @returns {Object}
   */
  prepareCarData(carData) {
    this._validateCarData(carData);

    return {
      brandId: carData.brandId,
      modelId: carData.modelId,
      variantId: carData.variantId || null,
      year: carData.year,
      registrationYear: carData.registrationYear || null,
      condition: carData.condition || 'used',
      mileageKm: carData.mileageKm || null,
      ownersCount: carData.ownersCount || 1,
      fuelType: carData.fuelType,
      transmission: carData.transmission,
      bodyType: carData.bodyType || null,
      color: carData.color || null,
      engineCapacityCc: carData.engineCapacityCc || null,
      powerBhp: carData.powerBhp || null,
      seats: carData.seats || 5,
      registrationNumber: carData.registrationNumber || null,
      registrationStateId: carData.registrationStateId || null,
      vinNumber: carData.vinNumber || null,
      insuranceValidUntil: carData.insuranceValidUntil || null,
      features: carData.features || null
    };
  }

  /**
   * Get car listing by listing ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>}
   */
  async getByListingId(listingId) {
    return await carListingRepository.getByListingId(listingId, true);
  }

  /**
   * Search car listings
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>}
   */
  async search(filters) {
    const cars = await carListingRepository.search(filters);

    return {
      success: true,
      message: 'Car listings retrieved successfully',
      data: cars
    };
  }
}

// Export singleton instance
export default new CarListingService();
