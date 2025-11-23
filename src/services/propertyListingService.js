/**
 * PropertyListing Service
 * Business logic for property-specific listing operations
 */

import propertyListingRepository from '#repositories/propertyListingRepository.js';

class PropertyListingService {
  /**
   * Validate property listing data
   * @param {Object} propertyData - Property listing data
   * @private
   */
  _validatePropertyData(propertyData) {
    // Validate required fields
    if (!propertyData.propertyType) {
      throw new Error('Property type is required');
    }

    if (!propertyData.listingType) {
      throw new Error('Listing type is required (sale/rent/pg/hostel)');
    }

    if (!propertyData.areaSqft || propertyData.areaSqft <= 0) {
      throw new Error('Area must be greater than 0');
    }

    // Validate bedrooms for residential properties
    const residentialTypes = ['apartment', 'house', 'villa'];
    if (residentialTypes.includes(propertyData.propertyType)) {
      if (!propertyData.bedrooms || propertyData.bedrooms < 0) {
        throw new Error('Bedrooms is required for residential properties');
      }

      if (!propertyData.bathrooms || propertyData.bathrooms < 0) {
        throw new Error('Bathrooms is required for residential properties');
      }
    }

    // Validate area values
    if (propertyData.plotAreaSqft && propertyData.plotAreaSqft < propertyData.areaSqft) {
      throw new Error('Plot area cannot be less than built-up area');
    }

    if (propertyData.carpetAreaSqft && propertyData.carpetAreaSqft > propertyData.areaSqft) {
      throw new Error('Carpet area cannot be greater than built-up area');
    }

    // Validate floor numbers
    if (propertyData.floorNumber && propertyData.totalFloors) {
      if (propertyData.floorNumber > propertyData.totalFloors) {
        throw new Error('Floor number cannot be greater than total floors');
      }
    }

    // Validate age
    if (propertyData.ageYears && propertyData.ageYears < 0) {
      throw new Error('Property age cannot be negative');
    }

    // Validate parking
    if (propertyData.parkingSpaces && propertyData.parkingSpaces < 0) {
      throw new Error('Parking spaces cannot be negative');
    }
  }

  /**
   * Prepare property data for creation/update
   * @param {Object} propertyData - Raw property data
   * @returns {Object}
   */
  preparePropertyData(propertyData) {
    this._validatePropertyData(propertyData);

    return {
      propertyType: propertyData.propertyType,
      listingType: propertyData.listingType,
      bedrooms: propertyData.bedrooms || null,
      bathrooms: propertyData.bathrooms || null,
      balconies: propertyData.balconies || 0,
      areaSqft: propertyData.areaSqft,
      plotAreaSqft: propertyData.plotAreaSqft || null,
      carpetAreaSqft: propertyData.carpetAreaSqft || null,
      floorNumber: propertyData.floorNumber || null,
      totalFloors: propertyData.totalFloors || null,
      ageYears: propertyData.ageYears || null,
      facing: propertyData.facing || null,
      furnished: propertyData.furnished || 'unfurnished',
      parkingSpaces: propertyData.parkingSpaces || 0,
      amenities: propertyData.amenities || null,
      availableFrom: propertyData.availableFrom || null,
      ownershipType: propertyData.ownershipType || null,
      reraApproved: propertyData.reraApproved || false,
      reraId: propertyData.reraId || null
    };
  }

  /**
   * Get property listing by listing ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>}
   */
  async getByListingId(listingId) {
    return await propertyListingRepository.getByListingId(listingId);
  }

  /**
   * Search property listings
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>}
   */
  async search(filters) {
    const properties = await propertyListingRepository.search(filters);

    return {
      success: true,
      message: 'Property listings retrieved successfully',
      data: properties
    };
  }
}

// Export singleton instance
export default new PropertyListingService();
