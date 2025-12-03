import db from '#models/index.js';

const { State, City } = db;

/**
 * Location Repository
 * Handles database operations for states and cities
 */
class LocationRepository {
  /**
   * Get all active states
   * @returns {Promise<Array>}
   */
  async getAllStates() {
    return await State.findAll({
      where: {
        isActive: true,
        isDeleted: false
      },
      attributes: ['id', 'slug', 'name', 'regionSlug', 'regionName'],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Get state by ID
   * @param {number} stateId
   * @returns {Promise<Object|null>}
   */
  async getStateById(stateId) {
    return await State.findOne({
      where: {
        id: stateId,
        isActive: true,
        isDeleted: false
      },
      attributes: ['id', 'slug', 'name', 'regionSlug', 'regionName']
    });
  }

  /**
   * Get cities by state ID
   * @param {number} stateId
   * @returns {Promise<Array>}
   */
  async getCitiesByStateId(stateId) {
    return await City.findAll({
      where: {
        stateId,
        isActive: true,
        isDeleted: false
      },
      attributes: [
        'id',
        'name',
        'district',
        'stateName',
        'pincode',
        'latitude',
        'longitude'
      ],
      order: [['display_order', 'ASC'], ['name', 'ASC']]
    });
  }
}

export default new LocationRepository();
