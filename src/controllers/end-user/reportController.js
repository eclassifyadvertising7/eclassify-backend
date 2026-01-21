import listingReportService from '#services/listingReportService.js';
import userReportService from '#services/userReportService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class ReportController {
  static async reportListing(req, res) {
    try {
      const userId = req.user.userId;
      const { listingId } = req.params;
      const { reportType, reason } = req.body;

      if (!reportType || !reason) {
        return errorResponse(res, 'Report type and reason are required', 400);
      }

      const result = await listingReportService.createReport(
        parseInt(listingId),
        userId,
        { reportType, reason }
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async reportUser(req, res) {
    try {
      const reporterId = req.user.userId;
      const { userId } = req.params;
      const { reportType, reason, context, relatedListingId, relatedChatRoomId } = req.body;

      if (!reportType || !reason) {
        return errorResponse(res, 'Report type and reason are required', 400);
      }

      const result = await userReportService.createReport(
        parseInt(userId),
        reporterId,
        { reportType, reason, context, relatedListingId, relatedChatRoomId }
      );

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ReportController;
