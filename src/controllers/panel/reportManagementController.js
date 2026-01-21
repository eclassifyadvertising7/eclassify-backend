import listingReportService from '#services/listingReportService.js';
import userReportService from '#services/userReportService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class ReportManagementController {
  static async getListingReports(req, res) {
    try {
      const filters = {
        status: req.query.status,
        reportType: req.query.reportType,
        listingId: req.query.listingId ? parseInt(req.query.listingId) : undefined,
        reportedBy: req.query.reportedBy ? parseInt(req.query.reportedBy) : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await listingReportService.getReports(filters, pagination);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getUserReports(req, res) {
    try {
      const filters = {
        status: req.query.status,
        reportType: req.query.reportType,
        reportedUserId: req.query.reportedUserId ? parseInt(req.query.reportedUserId) : undefined,
        reportedBy: req.query.reportedBy ? parseInt(req.query.reportedBy) : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await userReportService.getReports(filters, pagination);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getListingReportById(req, res) {
    try {
      const { reportId } = req.params;

      const result = await listingReportService.getReportById(parseInt(reportId));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getUserReportById(req, res) {
    try {
      const { reportId } = req.params;

      const result = await userReportService.getReportById(parseInt(reportId));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async updateListingReportStatus(req, res) {
    try {
      const { reportId } = req.params;
      const adminUserId = req.user.userId;
      const { status, adminNotes, actionTaken } = req.body;

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      const result = await listingReportService.updateReportStatus(
        parseInt(reportId),
        adminUserId,
        { status, adminNotes, actionTaken }
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateUserReportStatus(req, res) {
    try {
      const { reportId } = req.params;
      const adminUserId = req.user.userId;
      const { status, adminNotes, actionTaken } = req.body;

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      const result = await userReportService.updateReportStatus(
        parseInt(reportId),
        adminUserId,
        { status, adminNotes, actionTaken }
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getListingReportStatistics(req, res) {
    try {
      const result = await listingReportService.getStatistics();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getUserReportStatistics(req, res) {
    try {
      const result = await userReportService.getStatistics();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getReportsByListing(req, res) {
    try {
      const { listingId } = req.params;

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await listingReportService.getReportsByListing(parseInt(listingId), pagination);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getReportsByUser(req, res) {
    try {
      const { userId } = req.params;

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await userReportService.getReportsByUser(parseInt(userId), pagination);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ReportManagementController;
