import locationService from '#services/locationService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class LocationController {
  static async getStates(req, res) {
    try {
      const result = await locationService.getAllStates();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCitiesByState(req, res) {
    try {
      const { stateId } = req.params;
      const result = await locationService.getCitiesByStateId(stateId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAllCities(req, res) {
    try {
      const result = await locationService.getAllCities();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getPopularCities(req, res) {
    try {
      const result = await locationService.getPopularCities();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async searchCities(req, res) {
    try {
      const { query, stateId, limit } = req.query;
      const result = await locationService.searchCities({
        query,
        stateId: stateId ? parseInt(stateId) : null,
        limit: limit ? parseInt(limit) : 10
      });
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getNearbyCities(req, res) {
    try {
      const { lat, lng, radius } = req.query;
      
      if (!lat || !lng) {
        return errorResponse(res, 'Latitude and longitude are required', 400);
      }

      const result = await locationService.getNearbyCities({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: radius ? parseFloat(radius) : 50
      });
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default LocationController;
