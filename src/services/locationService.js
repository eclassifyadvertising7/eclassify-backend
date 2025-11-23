import locationRepository from '#repositories/locationRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

/**
 * Location Service
 * Business logic for states and cities
 */
class LocationService {
  /**
   * Get all states
   * @returns {Promise<Object>}
   */
  async getAllStates() {
    const states = await locationRepository.getAllStates();

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: states
    };
  }

  /**
   * Get cities by state ID
   * @param {number} stateId
   * @returns {Promise<Object>}
   */
  async getCitiesByStateId(stateId) {
    // Validate state ID
    if (!stateId || isNaN(stateId)) {
      throw new Error('Invalid state ID');
    }

    // Check if state exists
    const state = await locationRepository.getStateById(stateId);
    if (!state) {
      throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    // TODO: Replace with actual database query when cities table is populated
    // const cities = await locationRepository.getCitiesByStateId(stateId);

    // Hardcoded cities for now
    const hardcodedCities = [
      {
        id: 1,
        slug: 'pune',
        name: 'Pune',
        stateId: parseInt(stateId),
        stateName: state.name,
        district: 'Pune'
      },
      {
        id: 2,
        slug: 'mumbai',
        name: 'Mumbai',
        stateId: parseInt(stateId),
        stateName: state.name,
        district: 'Mumbai'
      },
      {
        id: 3,
        slug: 'satara',
        name: 'Satara',
        stateId: parseInt(stateId),
        stateName: state.name,
        district: 'Satara'
      },
      {
        id: 4,
        slug: 'nagpur',
        name: 'Nagpur',
        stateId: parseInt(stateId),
        stateName: state.name,
        district: 'Nagpur'
      }
    ];

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: hardcodedCities
    };
  }
}

export default new LocationService();
