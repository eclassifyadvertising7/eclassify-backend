/**
 * Form Data Parser Utility
 * Sanitizes and converts multipart form data to proper data types
 */

/**
 * Parse integer from form data
 * @param {any} value - Form data value
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {number|null}
 */
export const parseInteger = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse float from form data
 * @param {any} value - Form data value
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {number|null}
 */
export const parseFloat = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = Number.parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse boolean from form data
 * @param {any} value - Form data value
 * @param {boolean} defaultValue - Default value if parsing fails
 * @returns {boolean}
 */
export const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

/**
 * Parse string from form data (trim whitespace)
 * @param {any} value - Form data value
 * @param {any} defaultValue - Default value if empty
 * @returns {string|null}
 */
export const parseString = (value, defaultValue = null) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? defaultValue : trimmed;
};

/**
 * Parse JSON from form data
 * @param {any} value - Form data value (JSON string)
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any}
 */
export const parseJSON = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  // If already an object or array, return as-is
  if (typeof value === 'object') {
    return value;
  }
  
  try {
    return JSON.parse(value);
  } catch (error) {
    // Don't log error here - let parseArray handle it
    return defaultValue;
  }
};

/**
 * Parse array from form data (comma-separated or JSON)
 * @param {any} value - Form data value
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {Array}
 */
export const parseArray = (value, defaultValue = []) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  // If already an array
  if (Array.isArray(value)) {
    return value;
  }

  // If it's an object but not an array, return default
  if (typeof value === 'object') {
    return defaultValue;
  }

  // Convert to string and process
  const stringValue = String(value).trim();
  
  if (stringValue === '') {
    return defaultValue;
  }

  // Try parsing as JSON array first
  if (stringValue.startsWith('[') && stringValue.endsWith(']')) {
    try {
      const parsed = JSON.parse(stringValue);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (error) {
      // If JSON parsing fails, fall through to comma-separated parsing
    }
  }

  // Parse as comma-separated string
  return stringValue
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0); // Remove empty strings
};

/**
 * Parse listing data from form data
 * @param {Object} body - Request body
 * @returns {Object}
 */
export const parseListingData = (body) => {
  return {
    categoryId: parseInteger(body.categoryId),
    categoryType: parseString(body.categoryType),
    title: parseString(body.title),
    description: parseString(body.description),
    price: parseFloat(body.price),
    priceNegotiable: parseBoolean(body.priceNegotiable, false),
    stateId: parseInteger(body.stateId),
    cityId: parseInteger(body.cityId),
    locality: parseString(body.locality),
    address: parseString(body.address),
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude)
  };
};

/**
 * Parse car listing data from form data
 * @param {Object} body - Request body
 * @returns {Object}
 */
export const parseCarListingData = (body) => {
  return {
    brandId: parseInteger(body.brandId),
    modelId: parseInteger(body.modelId),
    variantId: parseInteger(body.variantId),
    year: parseInteger(body.year),
    registrationYear: parseInteger(body.registrationYear),
    condition: parseString(body.condition, 'used'),
    mileageKm: parseInteger(body.mileageKm),
    ownersCount: parseInteger(body.ownersCount, 1),
    fuelType: parseString(body.fuelType),
    transmission: parseString(body.transmission),
    bodyType: parseString(body.bodyType),
    color: parseString(body.color),
    engineCapacityCc: parseInteger(body.engineCapacityCc),
    powerBhp: parseInteger(body.powerBhp),
    seats: parseInteger(body.seats, 5),
    registrationNumber: parseString(body.registrationNumber),
    registrationStateId: parseInteger(body.registrationStateId),
    vinNumber: parseString(body.vinNumber),
    insuranceValidUntil: parseString(body.insuranceValidUntil),
    features: parseArray(body.features) // Always use parseArray for features to handle both JSON arrays and comma-separated strings
  };
};

/**
 * Parse property listing data from form data
 * @param {Object} body - Request body
 * @returns {Object}
 */
export const parsePropertyListingData = (body) => {
  return {
    propertyType: parseString(body.propertyType),
    listingType: parseString(body.listingType),
    bedrooms: parseInteger(body.bedrooms),
    bathrooms: parseInteger(body.bathrooms),
    balconies: parseInteger(body.balconies, 0),
    areaSqft: parseInteger(body.areaSqft),
    plotAreaSqft: parseInteger(body.plotAreaSqft),
    carpetAreaSqft: parseInteger(body.carpetAreaSqft),
    floorNumber: parseInteger(body.floorNumber),
    totalFloors: parseInteger(body.totalFloors),
    ageYears: parseInteger(body.ageYears),
    facing: parseString(body.facing),
    furnished: parseString(body.furnished, 'unfurnished'),
    parkingSpaces: parseInteger(body.parkingSpaces, 0),
    amenities: parseArray(body.amenities), // Always use parseArray for amenities to handle both JSON arrays and comma-separated strings
    availableFrom: parseString(body.availableFrom),
    ownershipType: parseString(body.ownershipType),
    reraApproved: parseBoolean(body.reraApproved, false),
    reraId: parseString(body.reraId)
  };
};
