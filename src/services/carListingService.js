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
    const currentYear = new Date().getFullYear();

    // Validate required fields
    if (!carData.brandId) {
      throw new Error('Car brand is required');
    }

    if (!carData.modelId) {
      throw new Error('Car model is required');
    }

    if (!carData.year) {
      throw new Error('Manufacturing year is required');
    }

    // Validate year range
    if (carData.year < 1900 || carData.year > currentYear + 1) {
      throw new Error(`Year must be between 1900 and ${currentYear + 1}`);
    }

    // Validate registration year
    if (carData.registrationYear && carData.registrationYear > carData.year) {
      throw new Error('Registration year cannot be greater than manufacturing year');
    }

    // Validate mileage for used cars
    if (carData.condition === 'used' && !carData.mileageKm) {
      throw new Error('Mileage is required for used cars');
    }

    if (carData.mileageKm && carData.mileageKm < 0) {
      throw new Error('Mileage cannot be negative');
    }

    // Validate fuel type
    if (!carData.fuelType) {
      throw new Error('Fuel type is required');
    }

    // Validate transmission
    if (!carData.transmission) {
      throw new Error('Transmission type is required');
    }

    // Validate owners count
    if (carData.ownersCount && carData.ownersCount < 1) {
      throw new Error('Owners count must be at least 1');
    }

    // Validate seats
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
