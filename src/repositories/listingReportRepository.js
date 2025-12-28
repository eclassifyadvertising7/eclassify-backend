import models, { sequelize } from '#models/index.js';
import { Op } from 'sequelize';

const { ListingReport, Listing, User } = models;

class ListingReportRepository {
  async create(reportData) {
    return await ListingReport.create(reportData);
  }

  async findById(id) {
    return await ListingReport.findByPk(id, {
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'slug', 'status', 'userId']
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
        }
      ]
    });
  }

  async findByListingAndUser(listingId, userId) {
    return await ListingReport.findOne({
      where: {
        listingId,
        reportedBy: userId
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

    if (filters.listingId) {
      where.listingId = filters.listingId;
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

    const { count, rows } = await ListingReport.findAndCountAll({
      where,
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'slug', 'status', 'userId', 'categoryId']
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
    const report = await ListingReport.findByPk(id);
    if (!report) return null;

    await report.update(updateData);
    return report;
  }

  async getReportCountByListing(listingId) {
    return await ListingReport.count({
      where: { listingId }
    });
  }

  async getReportCountByUser(userId) {
    return await ListingReport.count({
      where: { reportedBy: userId }
    });
  }

  async getStatistics() {
    const total = await ListingReport.count();
    const pending = await ListingReport.count({ where: { status: 'pending' } });
    const underReview = await ListingReport.count({ where: { status: 'under_review' } });
    const resolved = await ListingReport.count({ where: { status: 'resolved' } });
    const dismissed = await ListingReport.count({ where: { status: 'dismissed' } });

    return {
      total,
      pending,
      underReview,
      resolved,
      dismissed
    };
  }

  async getMostReportedListings(limit = 10) {
    const results = await ListingReport.findAll({
      attributes: [
        'listingId',
        [sequelize.fn('COUNT', sequelize.col('ListingReport.id')), 'reportCount']
      ],
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'slug', 'status']
        }
      ],
      group: ['listingId', 'listing.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('ListingReport.id')), 'DESC']],
      limit
    });

    return results;
  }
}

export default new ListingReportRepository();
