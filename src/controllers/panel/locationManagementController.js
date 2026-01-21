import locationService from '#services/locationService.js';
import { successResponse, errorResponse, validationErrorResponse, createResponse, notFoundResponse } from '#utils/responseFormatter.js';

class LocationManagementController {
  static async getAllStates(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await locationService.getAllStatesForAdmin({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        search: search || ''
      });
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error getting states:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async createState(req, res) {
    try {
      const result = await locationService.createState(req.body, req.user.userId);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error creating state:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateState(req, res) {
    try {
      const { stateId } = req.params;
      const result = await locationService.updateState(parseInt(stateId), req.body, req.user.userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error updating state:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteState(req, res) {
    try {
      const { stateId } = req.params;
      const result = await locationService.deleteState(parseInt(stateId), req.user.userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error deleting state:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAllCities(req, res) {
    try {
      const result = await locationService.getAllCitiesForAdmin();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error getting cities:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getCitiesByState(req, res) {
    try {
      const { stateId } = req.params;
      const { page, limit, search } = req.query;
      
      const result = await locationService.getCitiesByStateForAdmin(parseInt(stateId), {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        search: search || ''
      });
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error getting cities by state:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  static async createCity(req, res) {
    try {
      const result = await locationService.createCity(req.body, req.user.userId);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error creating city:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateCity(req, res) {
    try {
      const { cityId } = req.params;
      const result = await locationService.updateCity(parseInt(cityId), req.body, req.user.userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error updating city:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteCity(req, res) {
    try {
      const { cityId } = req.params;
      const result = await locationService.deleteCity(parseInt(cityId), req.user.userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error deleting city:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  static async toggleCityPopularity(req, res) {
    try {
      const { cityId } = req.params;
      const { isPopular } = req.body;

      if (!cityId || isNaN(cityId)) {
        return validationErrorResponse(res, [{ field: 'cityId', message: 'Valid city ID is required' }]);
      }

      if (typeof isPopular !== 'boolean') {
        return validationErrorResponse(res, [{ field: 'isPopular', message: 'isPopular must be a boolean value' }]);
      }

      const result = await locationService.toggleCityPopularity(
        parseInt(cityId),
        isPopular,
        req.user.userId
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error toggling city popularity:', error);
      return errorResponse(res, error.message, 400);
    }
  }
}

export default LocationManagementController;
