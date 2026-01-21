import listingReportRepository from '#repositories/listingReportRepository.js';
import listingRepository from '#repositories/listingRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class ListingReportService {
  async createReport(listingId, userId, reportData) {
    const listing = await listingRepository.getById(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.userId === userId) {
      throw new Error('You cannot report your own listing');
    }

    const existingReport = await listingReportRepository.findByListingAndUser(listingId, userId);
    if (existingReport) {
      throw new Error('You have already reported this listing');
    }

    const validReportTypes = ['spam', 'fraud', 'offensive', 'duplicate', 'wrong_category', 'misleading', 'sold', 'other'];
    if (!validReportTypes.includes(reportData.reportType)) {
      throw new Error('Invalid report type');
    }

    if (!reportData.reason || reportData.reason.trim().length < 10) {
      throw new Error('Reason must be at least 10 characters');
    }

    const report = await listingReportRepository.create({
      listingId,
      reportedBy: userId,
      reportType: reportData.reportType,
      reason: reportData.reason.trim(),
      status: 'pending'
    });

    return {
      success: true,
      message: 'Listing reported successfully. Our team will review it shortly.',
      data: {
        reportId: report.id,
        listingId: report.listingId,
        reportType: report.reportType,
        status: report.status
      }
    };
  }

  async getReports(filters, pagination) {
    const result = await listingReportRepository.getAll(filters, pagination);

    return {
      success: true,
      message: 'Listing reports retrieved successfully',
      data: result.reports,
      pagination: result.pagination
    };
  }

  async getReportById(reportId) {
    const report = await listingReportRepository.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    return {
      success: true,
      message: 'Report details retrieved successfully',
      data: report
    };
  }

  async updateReportStatus(reportId, adminUserId, statusData) {
    const report = await listingReportRepository.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];
    if (!validStatuses.includes(statusData.status)) {
      throw new Error('Invalid status');
    }

    const updateData = {
      status: statusData.status
    };

    if (statusData.status === 'under_review' && report.status === 'pending') {
      updateData.reviewedBy = adminUserId;
      updateData.reviewedAt = new Date();
    }

    if (statusData.adminNotes) {
      updateData.adminNotes = statusData.adminNotes;
    }

    if (statusData.actionTaken) {
      const validActions = ['none', 'listing_removed', 'listing_edited', 'user_warned', 'user_suspended', 'false_report'];
      if (!validActions.includes(statusData.actionTaken)) {
        throw new Error('Invalid action type');
      }
      updateData.actionTaken = statusData.actionTaken;
    }

    await listingReportRepository.update(reportId, updateData);

    return {
      success: true,
      message: `Report status updated to ${statusData.status}`,
      data: {
        reportId,
        status: statusData.status,
        actionTaken: statusData.actionTaken
      }
    };
  }

  async getStatistics() {
    const stats = await listingReportRepository.getStatistics();
    const mostReported = await listingReportRepository.getMostReportedListings(10);

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        ...stats,
        mostReportedListings: mostReported
      }
    };
  }

  async getReportsByListing(listingId, pagination) {
    const result = await listingReportRepository.getAll({ listingId }, pagination);

    return {
      success: true,
      message: 'Listing reports retrieved successfully',
      data: result.reports,
      pagination: result.pagination
    };
  }
}

export default new ListingReportService();
