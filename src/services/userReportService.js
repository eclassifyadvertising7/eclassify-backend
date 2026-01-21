import userReportRepository from '#repositories/userReportRepository.js';
import models from '#models/index.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

const { User } = models;

class UserReportService {
  async createReport(reportedUserId, reporterId, reportData) {
    if (reportedUserId === reporterId) {
      throw new Error('You cannot report yourself');
    }

    const reportedUser = await User.findByPk(reportedUserId);
    if (!reportedUser) {
      throw new Error('User not found');
    }

    const existingReport = await userReportRepository.findByReportedUserAndReporter(reportedUserId, reporterId);
    if (existingReport) {
      throw new Error('You have already reported this user');
    }

    const validReportTypes = ['scammer', 'fake_profile', 'harassment', 'spam', 'inappropriate_behavior', 'fake_listings', 'non_responsive', 'other'];
    if (!validReportTypes.includes(reportData.reportType)) {
      throw new Error('Invalid report type');
    }

    if (!reportData.reason || reportData.reason.trim().length < 10) {
      throw new Error('Reason must be at least 10 characters');
    }

    const report = await userReportRepository.create({
      reportedUserId,
      reportedBy: reporterId,
      reportType: reportData.reportType,
      reason: reportData.reason.trim(),
      context: reportData.context?.trim() || null,
      relatedListingId: reportData.relatedListingId || null,
      relatedChatRoomId: reportData.relatedChatRoomId || null,
      status: 'pending'
    });

    return {
      success: true,
      message: 'User reported successfully. Our team will review it shortly.',
      data: {
        reportId: report.id,
        reportedUserId: report.reportedUserId,
        reportType: report.reportType,
        status: report.status
      }
    };
  }

  async getReports(filters, pagination) {
    const result = await userReportRepository.getAll(filters, pagination);

    return {
      success: true,
      message: 'User reports retrieved successfully',
      data: result.reports,
      pagination: result.pagination
    };
  }

  async getReportById(reportId) {
    const report = await userReportRepository.findById(reportId);
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
    const report = await userReportRepository.findById(reportId);
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
      const validActions = ['none', 'warning_sent', 'user_suspended', 'user_banned', 'listings_removed', 'false_report'];
      if (!validActions.includes(statusData.actionTaken)) {
        throw new Error('Invalid action type');
      }
      updateData.actionTaken = statusData.actionTaken;
    }

    await userReportRepository.update(reportId, updateData);

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
    const stats = await userReportRepository.getStatistics();
    const mostReported = await userReportRepository.getMostReportedUsers(10);

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        ...stats,
        mostReportedUsers: mostReported
      }
    };
  }

  async getReportsByUser(userId, pagination) {
    const result = await userReportRepository.getAll({ reportedUserId: userId }, pagination);

    return {
      success: true,
      message: 'User reports retrieved successfully',
      data: result.reports,
      pagination: result.pagination
    };
  }
}

export default new UserReportService();
