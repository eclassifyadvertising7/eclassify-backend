import dataRequestService from '#services/dataRequestService.js';
import { successResponse, errorResponse, paginatedResponse } from '#utils/responseFormatter.js';

class DataRequestController {
  static async createRequest(req, res) {
    try {
      const userId = req.user.userId;
      const result = await dataRequestService.createRequest(userId, req.body);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getMyRequests(req, res) {
    try {
      const userId = req.user.userId;
      const { status, requestType, page, limit } = req.query;

      const filters = {
        status,
        requestType,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      };

      const result = await dataRequestService.getUserRequests(userId, filters);

      return paginatedResponse(
        res,
        result.data.requests,
        {
          page: result.data.page,
          limit: result.data.limit,
          total: result.data.total,
          totalPages: result.data.totalPages
        },
        result.message
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getRequestById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await dataRequestService.getRequestById(id);

      // Check if user owns this request
      if (result.data.userId !== userId) {
        return errorResponse(res, 'You do not have permission to view this request', 403);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
}

export default DataRequestController;
