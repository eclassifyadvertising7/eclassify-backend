import models from '#models/index.js';
const { Location } = models;
import sequelize from '#config/database.js';

class LocationRepository {
  
  async findByProviderAndPlaceId(provider, placeId) {
    return await Location.findOne({
      where: { 
        provider, 
        placeId 
      }
    });
  }
  
  async create(locationData) {
    console.log('[LOCATION REPOSITORY] ========== START create ==========');
    console.log('[LOCATION REPOSITORY] Attempting to create location with data:');
    console.log('[LOCATION REPOSITORY] - placeId:', locationData.placeId);
    console.log('[LOCATION REPOSITORY] - provider:', locationData.provider);
    console.log('[LOCATION REPOSITORY] - name:', locationData.name);
    console.log('[LOCATION REPOSITORY] - latitude:', locationData.latitude);
    console.log('[LOCATION REPOSITORY] - longitude:', locationData.longitude);
    console.log('[LOCATION REPOSITORY] - type:', locationData.type);
    
    try {
      const result = await Location.create(locationData);
      console.log('[LOCATION REPOSITORY] ✓ Successfully created location');
      console.log('[LOCATION REPOSITORY] - Created ID:', result.id);
      console.log('[LOCATION REPOSITORY] - Has location column:', result.location ? 'YES' : 'NO');
      console.log('[LOCATION REPOSITORY] ========== END create (success) ==========');
      return result;
    } catch (error) {
      console.error('[LOCATION REPOSITORY] ✗ Failed to create location');
      console.error('[LOCATION REPOSITORY] Error name:', error.name);
      console.error('[LOCATION REPOSITORY] Error message:', error.message);
      console.error('[LOCATION REPOSITORY] SQL:', error.sql);
      console.error('[LOCATION REPOSITORY] Parameters:', error.parameters);
      console.error('[LOCATION REPOSITORY] Full error:', error);
      console.error('[LOCATION REPOSITORY] ========== END create (error) ==========');
      throw error;
    }
  }
  
  async incrementUsage(locationId) {
    return await Location.update(
      { 
        usageCount: sequelize.literal('usage_count + 1'),
        lastUsedAt: new Date()
      },
      { 
        where: { id: locationId } 
      }
    );
  }
  
  async getById(id) {
    return await Location.findByPk(id);
  }
  
  async update(id, updateData) {
    return await Location.update(updateData, {
      where: { id }
    });
  }
}

export default new LocationRepository();
