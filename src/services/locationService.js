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

    // Get cities from database
    const cities = await locationRepository.getCitiesByStateId(stateId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: cities
    };
  }
}

export default new LocationService();
