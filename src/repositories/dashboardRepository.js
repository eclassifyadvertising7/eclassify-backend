import models from '#models/index.js';
import { Op } from 'sequelize';

const { User, Listing, Transaction, SubscriptionPlan, UserSubscription, Invoice } = models;

class DashboardRepository {
  async getTotalUsers() {
    return await User.count();
  }

  async getActiveUsers() {
    return await User.count({
      where: {
        isActive: true
      }
    });
  }

  async getTotalListings() {
    return await Listing.count();
  }

  async getActiveListings() {
    return await Listing.count({
      where: {
        status: 'active'
      }
    });
  }

  async getSoldListings() {
    return await Listing.count({
      where: {
        status: 'sold'
      }
    });
  }

  async getPendingListings() {
    return await Listing.count({
      where: {
        status: 'pending'
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
    return await SubscriptionPlan.count();
  }

  async getActiveSubscriptionPlans() {
    return await SubscriptionPlan.count({
      where: {
        isActive: true
      }
    });
  }

  async getActiveSubscriptions() {
    return await UserSubscription.count({
      where: {
        status: 'active'
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
          where: { status }
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
          attributes: ['id', ['full_name', 'fullName'], 'mobile']
        }
      ],
      attributes: [
        'id',
        'transactionNumber',
        'amount',
        'currency',
        'status',
        ['completed_at', 'completedAt'],
        ['created_at', 'createdAt']
      ],
      order: [['completed_at', 'DESC']],
      limit
    });
  }

  async getRecentListings(limit = 10) {
    return await Listing.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', ['full_name', 'fullName'], 'mobile']
        }
      ],
      attributes: [
        'id',
        'title',
        'price',
        'status',
        ['created_at', 'createdAt'],
        ['updated_at', 'updatedAt']
      ],
      order: [['created_at', 'DESC']],
      limit
    });
  }
}

export default new DashboardRepository();
