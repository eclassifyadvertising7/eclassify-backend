import models, { sequelize } from '#models/index.js';
import { Op } from 'sequelize';

const { UserReport, User, Listing, ChatRoom } = models;

class UserReportRepository {
  async create(reportData) {
    return await UserReport.create(reportData);
  }

  async findById(id) {
    return await UserReport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'fullName', 'email', 'mobile', 'status', 'isActive']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'fullName', 'email', 'mobile']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Listing,
          as: 'relatedListing',
          attributes: ['id', 'title', 'slug']
        },
        {
          model: ChatRoom,
          as: 'relatedChatRoom',
          attributes: ['id', 'listingId']
        }
      ]
    });
  }

  async findByReportedUserAndReporter(reportedUserId, reporterId) {
    return await UserReport.findOne({
      where: {
        reportedUserId,
        reportedBy: reporterId
      }
    });
  }

  async getAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.reportType) {
      where.reportType = filters.reportType;
    }

    if (filters.reportedUserId) {
      where.reportedUserId = filters.reportedUserId;
    }

    if (filters.reportedBy) {
      where.reportedBy = filters.reportedBy;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt[Op.gte] = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt[Op.lte] = new Date(filters.endDate);
      }
    }

    const { count, rows } = await UserReport.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'fullName', 'email', 'mobile', 'status', 'isActive']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'fullName', 'email', 'mobile']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Listing,
          as: 'relatedListing',
          attributes: ['id', 'title', 'slug']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      reports: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async update(id, updateData) {
    const report = await UserReport.findByPk(id);
    if (!report) return null;

    await report.update(updateData);
    return report;
  }

  async getReportCountByUser(userId) {
    return await UserReport.count({
      where: { reportedUserId: userId }
    });
  }

  async getReportCountByReporter(reporterId) {
    return await UserReport.count({
      where: { reportedBy: reporterId }
    });
  }

  async getStatistics() {
    const total = await UserReport.count();
    const pending = await UserReport.count({ where: { status: 'pending' } });
    const underReview = await UserReport.count({ where: { status: 'under_review' } });
    const resolved = await UserReport.count({ where: { status: 'resolved' } });
    const dismissed = await UserReport.count({ where: { status: 'dismissed' } });

    return {
      total,
      pending,
      underReview,
      resolved,
      dismissed
    };
  }

  async getMostReportedUsers(limit = 10) {
    const results = await UserReport.findAll({
      attributes: [
        'reportedUserId',
        [sequelize.fn('COUNT', sequelize.col('UserReport.id')), 'reportCount']
      ],
      include: [
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'fullName', 'email', 'status', 'isActive']
        }
      ],
      group: ['reportedUserId', 'reportedUser.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('UserReport.id')), 'DESC']],
      limit
    });

    return results;
  }
}

export default new UserReportRepository();
