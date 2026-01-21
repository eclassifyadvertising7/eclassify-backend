import dashboardRepository from '#repositories/dashboardRepository.js';
import { SUCCESS_MESSAGES } from '#utils/constants/messages.js';

class DashboardService {
  async getOverviewStats() {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      soldListings,
      pendingListings,
      totalRevenue,
      totalSubscriptionPlans,
      activeSubscriptionPlans,
      activeSubscriptions
    ] = await Promise.all([
      dashboardRepository.getTotalUsers(),
      dashboardRepository.getActiveUsers(),
      dashboardRepository.getTotalListings(),
      dashboardRepository.getActiveListings(),
      dashboardRepository.getSoldListings(),
      dashboardRepository.getPendingListings(),
      dashboardRepository.getTotalRevenue(),
      dashboardRepository.getTotalSubscriptionPlans(),
      dashboardRepository.getActiveSubscriptionPlans(),
      dashboardRepository.getActiveSubscriptions()
    ]);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        listings: {
          total: totalListings,
          active: activeListings,
          sold: soldListings,
          pending: pendingListings
        },
        revenue: {
          total: totalRevenue,
          currency: 'INR'
        },
        subscriptionPlans: {
          total: totalSubscriptionPlans,
          active: activeSubscriptionPlans
        },
        subscriptions: {
          active: activeSubscriptions
        }
      }
    };
  }

  async getDetailedStats(period = 'all') {
    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        endDate = new Date();
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    const [
      listingsByStatus,
      periodRevenue,
      recentTransactions,
      recentListings
    ] = await Promise.all([
      dashboardRepository.getListingsByStatus(),
      period !== 'all' ? dashboardRepository.getRevenueByPeriod(startDate, endDate) : dashboardRepository.getTotalRevenue(),
      dashboardRepository.getRecentTransactions(10),
      dashboardRepository.getRecentListings(10)
    ]);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        period,
        listingsByStatus,
        revenue: {
          amount: periodRevenue,
          currency: 'INR',
          period
        },
        recentTransactions,
        recentListings
      }
    };
  }
}

export default new DashboardService();
