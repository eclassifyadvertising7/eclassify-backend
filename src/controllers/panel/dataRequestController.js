import dataRequestService from '#services/dataRequestService.js';
import { successResponse, errorResponse, paginatedResponse } from '#utils/responseFormatter.js';

class DataRequestController {
  static async getAllRequests(req, res) {
    try {
      const { status, requestType, search, startDate, endDate, page, limit } = req.query;

      const filters = {
        status,
        requestType,
        search,
        startDate,
        endDate,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      };

      const result = await dataRequestService.getAllRequests(filters);

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
      const result = await dataRequestService.getRequestById(id);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const reviewerId = req.user.userId;

      const result = await dataRequestService.approveRequest(id, reviewerId, req.body);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const reviewerId = req.user.userId;

      const result = await dataRequestService.rejectRequest(id, reviewerId, req.body);

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getStatistics(req, res) {
    try {
      const result = await dataRequestService.getStatistics();

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default DataRequestController;
