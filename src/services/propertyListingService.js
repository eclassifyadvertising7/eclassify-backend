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
    if (!propertyData.propertyType) {
      throw new Error('Property type is required');
    }

    if (!propertyData.listingType) {
      throw new Error('Listing type is required (sale/rent/other)');
    }

    if (!propertyData.areaSqft || propertyData.areaSqft <= 0) {
      throw new Error('Area must be greater than 0');
    }

    if (propertyData.unitType === 'custom' && !propertyData.customUnitType) {
      throw new Error('Custom unit type is required when unit type is "custom"');
    }

    const residentialTypes = ['apartment', 'house'];
    if (residentialTypes.includes(propertyData.propertyType)) {
      if (!propertyData.bathrooms || propertyData.bathrooms < 0) {
        throw new Error('Bathrooms is required for residential properties');
      }
      if (!propertyData.furnished) {
        throw new Error('Furnished status is required for residential properties');
      }
    }

    if (propertyData.bedrooms !== undefined && propertyData.bedrooms !== null && propertyData.bedrooms < 0) {
      throw new Error('Bedrooms cannot be negative');
    }

    const commercialTypes = ['office', 'shop'];
    if (commercialTypes.includes(propertyData.propertyType)) {
      if (!propertyData.furnished) {
        throw new Error('Furnished status is required for commercial properties');
      }
    }

    const sharedTypes = ['pg', 'hostel'];
    if (sharedTypes.includes(propertyData.propertyType)) {
      if (!propertyData.bathrooms || propertyData.bathrooms < 0) {
        throw new Error('Bathrooms is required for PG/Hostel');
      }
      if (!propertyData.furnished) {
        throw new Error('Furnished status is required for PG/Hostel');
      }
    }

    if (propertyData.propertyType === 'plot') {
      if (propertyData.plotLengthFt && propertyData.plotLengthFt <= 0) {
        throw new Error('Plot length must be greater than 0');
      }
      if (propertyData.plotWidthFt && propertyData.plotWidthFt <= 0) {
        throw new Error('Plot width must be greater than 0');
      }
    }

    if (propertyData.propertyType === 'warehouse') {
      if (propertyData.ceilingHeightFt && propertyData.ceilingHeightFt <= 0) {
        throw new Error('Ceiling height must be greater than 0');
      }
      if (propertyData.loadingDocks && propertyData.loadingDocks < 0) {
        throw new Error('Loading docks cannot be negative');
      }
    }

    if (propertyData.plotAreaSqft && propertyData.plotAreaSqft < propertyData.areaSqft) {
      throw new Error('Plot area cannot be less than built-up area');
    }

    if (propertyData.carpetAreaSqft && propertyData.carpetAreaSqft > propertyData.areaSqft) {
      throw new Error('Carpet area cannot be greater than built-up area');
    }

    if (propertyData.floorNumber && propertyData.totalFloors) {
      if (propertyData.floorNumber > propertyData.totalFloors) {
        throw new Error('Floor number cannot be greater than total floors');
      }
    }

    if (propertyData.ageYears && propertyData.ageYears < 0) {
      throw new Error('Property age cannot be negative');
    }

    if (propertyData.parkingSpaces && propertyData.parkingSpaces < 0) {
      throw new Error('Parking spaces cannot be negative');
    }

    if (propertyData.washrooms && propertyData.washrooms < 0) {
      throw new Error('Washrooms cannot be negative');
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
      unitType: propertyData.unitType || null,
      customUnitType: propertyData.customUnitType || null,
      bathrooms: propertyData.bathrooms || null,
      balconies: propertyData.balconies || null,
      areaSqft: propertyData.areaSqft,
      plotAreaSqft: propertyData.plotAreaSqft || null,
      carpetAreaSqft: propertyData.carpetAreaSqft || null,
      floorNumber: propertyData.floorNumber || null,
      totalFloors: propertyData.totalFloors || null,
      ageYears: propertyData.ageYears || null,
      facing: propertyData.facing || null,
      furnished: propertyData.furnished || null,
      parkingSpaces: propertyData.parkingSpaces || null,
      washrooms: propertyData.washrooms || null,
      amenities: propertyData.amenities || null,
      foodIncluded: propertyData.foodIncluded || null,
      genderPreference: propertyData.genderPreference || null,
      boundaryWall: propertyData.boundaryWall || null,
      cornerPlot: propertyData.cornerPlot || null,
      gatedCommunity: propertyData.gatedCommunity || null,
      coveredAreaSqft: propertyData.coveredAreaSqft || null,
      openAreaSqft: propertyData.openAreaSqft || null,
      ceilingHeightFt: propertyData.ceilingHeightFt || null,
      loadingDocks: propertyData.loadingDocks || null,
      plotLengthFt: propertyData.plotLengthFt || null,
      plotWidthFt: propertyData.plotWidthFt || null,
      plotElevationFt: propertyData.plotElevationFt || null,
      availableFrom: propertyData.availableFrom || null,
      ownershipType: propertyData.ownershipType || null,
      reraApproved: propertyData.reraApproved || false,
      reraId: propertyData.reraId || null,
      otherDetails: propertyData.otherDetails || null
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
