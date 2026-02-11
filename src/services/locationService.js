import locationRepository from '#repositories/locationRepository.js';
import config from '#config/env.js';

class LocationService {
  
  async cacheLocation(locationData, userId = null) {
    console.log('[LOCATION SERVICE] ========== START cacheLocation ==========');
    console.log('[LOCATION SERVICE] Input locationData:', JSON.stringify(locationData, null, 2));
    console.log('[LOCATION SERVICE] userId:', userId);
    
    // Get provider from env (ola_maps, google_maps, mapbox, manual)
    const provider = config.map?.provider || 'ola_maps';
    const placeId = locationData.place_id;
    
    console.log('[LOCATION SERVICE] Provider:', provider);
    console.log('[LOCATION SERVICE] Place ID:', placeId);
    
    if (!placeId) {
      console.error('[LOCATION SERVICE] ERROR: place_id is missing!');
      throw new Error('place_id is required in locationData');
    }
    
    console.log('[LOCATION SERVICE] Checking for existing location...');
    const existingLocation = await locationRepository.findByProviderAndPlaceId(
      provider, 
      placeId
    );
    
    if (existingLocation) {
      console.log('[LOCATION SERVICE] Found existing location, ID:', existingLocation.id);
      await locationRepository.incrementUsage(existingLocation.id);
      console.log('[LOCATION SERVICE] Incremented usage count');
      console.log('[LOCATION SERVICE] ========== END (existing location) ==========');
      return existingLocation;
    }
    
    console.log('[LOCATION SERVICE] No existing location found, creating new...');
    const parsedData = this._parseLocationData(locationData, provider, userId);
    console.log('[LOCATION SERVICE] Parsed data:', JSON.stringify(parsedData, null, 2));
    
    console.log('[LOCATION SERVICE] Calling repository.create...');
    try {
      const newLocation = await locationRepository.create(parsedData);
      console.log('[LOCATION SERVICE] Successfully created location, ID:', newLocation.id);
      console.log('[LOCATION SERVICE] ========== END (new location) ==========');
      return newLocation;
    } catch (error) {
      console.error('[LOCATION SERVICE] ERROR creating location:', error.message);
      console.error('[LOCATION SERVICE] Error stack:', error.stack);
      console.error('[LOCATION SERVICE] Failed data:', JSON.stringify(parsedData, null, 2));
      throw error;
    }
  }
  
  _parseLocationData(locationData, provider, userId) {
    console.log('[LOCATION SERVICE] ========== START _parseLocationData ==========');
    
    const addressComponents = locationData.address_components || [];
    console.log('[LOCATION SERVICE] Address components count:', addressComponents.length);
    
    const country = addressComponents.find(c => 
      c.types?.includes('country')
    )?.long_name || null;
    
    const state = addressComponents.find(c => 
      c.types?.includes('administrative_area_level_1')
    )?.long_name || null;
    
    const district = addressComponents.find(c => 
      c.types?.includes('administrative_area_level_2')
    )?.long_name || null;
    
    let city = null;
    const locationType = locationData.types?.[0];
    if (locationType === 'locality' || locationType === 'sublocality') {
      city = locationData.name;
    } else {
      city = addressComponents.find(c => 
        c.types?.includes('locality')
      )?.long_name || null;
    }
    
    const latitude = locationData.geometry.location.lat;
    const longitude = locationData.geometry.location.lng;
    
    console.log('[LOCATION SERVICE] Extracted data:');
    console.log('  - Country:', country);
    console.log('  - State:', state);
    console.log('  - District:', district);
    console.log('  - City:', city);
    console.log('  - Type:', locationType);
    console.log('  - Latitude:', latitude);
    console.log('  - Longitude:', longitude);
    
    const result = {
      placeId: locationData.place_id,
      provider: provider,
      name: locationData.name,
      type: locationType || 'locality',
      country: country,
      state: state,
      district: district,
      city: city,
      locality: locationData.formatted_address || null,
      pincode: locationData.pincode || null,
      latitude: latitude,
      longitude: longitude,
      formattedAddress: locationData.formatted_address,
      types: locationData.types || [],
      addressComponents: addressComponents,
      rawResponse: locationData,
      createdBy: userId
    };
    
    console.log('[LOCATION SERVICE] ========== END _parseLocationData ==========');
    return result;
  }
}

export default new LocationService();
