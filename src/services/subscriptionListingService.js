import subscriptionRepository from '#repositories/subscriptionRepository.js';
import listingRepository from '#repositories/listingRepository.js';

class SubscriptionListingService {
  /**
   * Get user's subscription listings with statistics and pagination
   * @param {number} userId 
   * @param {number} subscriptionId 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getUserSubscriptionListings(userId, subscriptionId, options = {}) {
    const { page = 1, limit = 20, status = 'all' } = options;

    if (!userId || isNaN(userId) || !subscriptionId || isNaN(subscriptionId)) {
      throw new Error('Invalid user ID or subscription ID');
    }

    // Get subscription info and verify ownership from repository
    const subscription = await subscriptionRepository.getUserSubscriptionById(userId, subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found or access denied');
    }

    // Get listings with pagination from repository
    const { count, rows: listings } = await listingRepository.getSubscriptionListings(
      userId, 
      subscriptionId, 
      { page, limit, status }
    );

    // Get statistics using optimized single-query approach
    const stats = await listingRepository.getSubscriptionListingStats(userId, subscriptionId);

    return {
      subscription: {
        id: subscription.id,
        planName: subscription.planName,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        listingQuota: subscription.maxTotalListings || subscription.listingQuotaLimit || 0,
        usedQuota: stats.quotaConsuming
      },
      stats,
      listings: this._formatListings(listings),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  /**
   * Get user's subscription summary with listing counts for all subscriptions
   * @param {number} userId 
   * @returns {Promise<Array>}
   */
  async getUserSubscriptionSummary(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid user ID');
    }

    // Get all user subscriptions from repository
    const subscriptions = await subscriptionRepository.getUserSubscriptions(userId);

    const subscriptionSummary = [];

    for (const subscription of subscriptions) {
      // Get listing statistics using optimized single-query approach
      const stats = await listingRepository.getSubscriptionListingStats(userId, subscription.id);

      const listingQuota = subscription.maxTotalListings || subscription.listingQuotaLimit || 0;
      const usedQuota = stats.quotaConsuming;

      subscriptionSummary.push({
        id: subscription.id,
        planName: subscription.planName,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        listingQuota,
        usedQuota,
        remainingQuota: Math.max(0, listingQuota - usedQuota),
        stats: {
          total: stats.total,
          active: stats.active,
          sold: stats.sold,
          expired: stats.expired,
          rejected: stats.rejected,
          pending: stats.pending,
          draft: stats.draft,
          quotaConsuming: stats.quotaConsuming
        }
      });
    }

    return subscriptionSummary;
  }

  /**
   * Format listings data for response (private method)
   * @param {Array} listings 
   * @returns {Array}
   */
  _formatListings(listings) {
    return listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      categoryName: listing.category?.name || 'Unknown',
      location: listing.locality,
      cityName: listing.cityName,
      stateName: listing.stateName,
      isFeatured: listing.isFeatured,
      publishedAt: listing.publishedAt,
      totalFavorites: listing.totalFavorites || 0,
      shareCode: listing.shareCode,
      lastRepublishedAt: listing.lastRepublishedAt,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      coverImage: listing.coverImage,
      viewCount: listing.viewCount || 0,
      contactCount: listing.contactCount || 0
    }));
  }
}

export default new SubscriptionListingService();