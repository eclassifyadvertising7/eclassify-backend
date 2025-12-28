import models from '#models/index.js';
import { Op } from 'sequelize';

const { User, Listing, Transaction, SubscriptionPlan, UserSubscription, Invoice } = models;

class DashboardRepository {
  async getTotalUsers() {
    return await User.count({
      where: {
        deletedAt: null
      }
    });
  }

  async getActiveUsers() {
    return await User.count({
      where: {
        isActive: true,
        deletedAt: null
      }
    });
  }

  async getTotalListings() {
    return await Listing.count({
      where: {
        deletedAt: null
      }
    });
  }

  async getActiveListings() {
    return await Listing.count({
      where: {
        status: 'active',
        deletedAt: null
      }
    });
  }

  async getSoldListings() {
    return await Listing.count({
      where: {
        status: 'sold',
        deletedAt: null
      }
    });
  }

  async getPendingListings() {
    return await Listing.count({
      where: {
        status: 'pending',
        deletedAt: null
      }
    });
  }

  async getTotalRevenue() {
    const result = await Transaction.sum('amount', {
      where: {
        status: 'completed',
        transactionType: 'payment'
      }
    });
    return result || 0;
  }

  async getTotalSubscriptionPlans() {
    return await SubscriptionPlan.count({
      where: {
        deletedAt: null
      }
    });
  }

  async getActiveSubscriptionPlans() {
    return await SubscriptionPlan.count({
      where: {
        isActive: true,
        deletedAt: null
      }
    });
  }

  async getActiveSubscriptions() {
    return await UserSubscription.count({
      where: {
        status: 'active',
        deletedAt: null
      }
    });
  }

  async getRevenueByPeriod(startDate, endDate) {
    const result = await Transaction.sum('amount', {
      where: {
        status: 'completed',
        transactionType: 'payment',
        completedAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    return result || 0;
  }

  async getListingsByStatus() {
    const statuses = ['draft', 'pending', 'active', 'expired', 'sold', 'rejected'];
    const results = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await Listing.count({
          where: { status, deletedAt: null }
        })
      }))
    );
    return results;
  }

  async getRecentTransactions(limit = 10) {
    return await Transaction.findAll({
      where: {
        status: 'completed'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'mobile']
        }
      ],
      order: [['completed_at', 'DESC']],
      limit
    });
  }

  async getRecentListings(limit = 10) {
    return await Listing.findAll({
      where: {
        deletedAt: null
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'mobile']
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });
  }
}

export default new DashboardRepository();
