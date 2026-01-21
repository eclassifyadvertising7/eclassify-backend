/**
 * Essential Data Builder
 * Builds essential_data JSONB for listing cards
 */

export function buildCarEssentialData(carListing) {
  if (!carListing) return null;

  return {
    brandName: carListing.brandName || null,
    modelName: carListing.modelName || null,
    variantName: carListing.variantName || null,
    year: carListing.year || null,
    mileageKm: carListing.mileageKm || null,
    fuelType: carListing.fuelType || null
  };
}

export function buildPropertyEssentialData(propertyListing) {
  if (!propertyListing) return null;

  // TODO: Implement property essential data
  return null;
}

export function buildEssentialData(listing, categoryData) {
  if (!categoryData) return null;

  if (listing.categoryType === 'car') {
    return buildCarEssentialData(categoryData);
  }

  if (listing.categoryType === 'property') {
    return buildPropertyEssentialData(categoryData);
  }

  return null;
}
