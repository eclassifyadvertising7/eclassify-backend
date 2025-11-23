import locationService from '#services/locationService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

/**
 * Location Controller
 * Handles common location endpoints (states, cities)
 */
class LocationController {
  /**
   * Get all states
   * @route GET /api/common/states
   * @access Public
   */
  static async getStates(req, res) {
    try {
      const result = await locationService.getAllStates();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get cities by state ID
   * @route GET /api/common/cities/:stateId
   * @access Public
   */
  static async getCitiesByState(req, res) {
    try {
      const { stateId } = req.params;
      const result = await locationService.getCitiesByStateId(stateId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default LocationController;
