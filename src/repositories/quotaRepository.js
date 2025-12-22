/**
 * Quota Repository
 * Database operations for quota management and calculations
 */

import models from '#models/index.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';

const { Listing, UserSubscription, SubscriptionPlan, User } = models;

class QuotaRepository {
  /**
   * Count user listings in rolling period (for free plans)
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @param {number} days - Rolling period in days (default 30)
   * @returns {Promise<number>} Count of listings
   */
  async countUserListingsInPeriod(userId, categoryId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const count = await Listing.count({
      where: {
        userId,
        categoryId,
        status: {
          [Op.in]: ['pending', 'active', 'sold']
        },
        created_at: {
          [Op.gte]: startDate
        }
      }
    });

    return count;
  }

  /**
   * Count user total listings for subscription (for paid plans)
   * @param {number} userId - User ID
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<number>} Count of listings
   */
  async countUserTotalListings(userId, subscriptionId) {
    const count = await Listing.count({
      where: {
        userId,
        userSubscriptionId: subscriptionId,
        status: {
          [Op.in]: ['pending', 'active', 'sold']
        }
      }
    });

    return count;
  }

  /**
   * Get active subscription with quota details for category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object|null>} Subscription with plan details
   */
  async getActiveSubscriptionWithQuota(userId, categoryId) {
    const subscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endsAt: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          where: {
            categoryId: categoryId
          },
          required: true
        }
      ]
    });

    return subscription;
  }

  /**
   * Get free plan for category
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object|null>} Free plan details
   */
  async getFreePlanForCategory(categoryId) {
    const freePlan = await SubscriptionPlan.findOne({
      where: {
        categoryId,
        isFreePlan: true,
        isActive: true
      }
    });

    return freePlan;
  }

  /**
   * Update listing with subscription tracking
   * @param {number} listingId - Listing ID
   * @param {number} subscriptionId - Subscription ID
   * @param {boolean} isPaidListing - Whether it's a paid listing
   * @returns {Promise<Object>} Updated listing
   */
  async updateListingQuotaTracking(listingId, subscriptionId, isPaidListing = false) {
    const [affectedRows] = await Listing.update(
      {
        userSubscriptionId: subscriptionId,
        isPaidListing
      },
      {
        where: { id: listingId }
      }
    );

    if (affectedRows === 0) {
      throw new Error('Listing not found or could not be updated');
    }

    return await Listing.findByPk(listingId);
  }

  /**
   * Get user's quota usage summary for category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Quota usage summary
   */
  async getUserQuotaUsage(userId, categoryId) {
    // Get active subscription
    const subscription = await this.getActiveSubscriptionWithQuota(userId, categoryId);
    
    if (!subscription) {
      // Check for free plan
      const freePlan = await this.getFreePlanForCategory(categoryId);
      if (!freePlan) {
        return null;
      }

      // Calculate rolling quota for free plan
      const rollingCount = await this.countUserListingsInPeriod(
        userId, 
        categoryId, 
        freePlan.listingQuotaRollingDays || 30
      );

      return {
        planType: 'free',
        planName: freePlan.name,
        quotaType: 'rolling',
        quotaLimit: freePlan.listingQuotaLimit,
        quotaUsed: rollingCount,
        quotaRemaining: Math.max(0, freePlan.listingQuotaLimit - rollingCount),
        rollingDays: freePlan.listingQuotaRollingDays || 30,
        subscription: null,
        freePlan
      };
    }

    // Calculate total quota for paid plan
    const totalCount = await this.countUserTotalListings(userId, subscription.id);

    return {
      planType: 'paid',
      planName: subscription.planName,
      quotaType: 'total',
      quotaLimit: subscription.maxTotalListings,
      quotaUsed: totalCount,
      quotaRemaining: Math.max(0, subscription.maxTotalListings - totalCount),
      subscription,
      freePlan: null
    };
  }

  /**
   * Get all active subscriptions for user (all categories)
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of active subscriptions
   */
  async getUserAllActiveSubscriptions(userId) {
    const subscriptions = await UserSubscription.findAll({
      where: {
        userId,
        status: 'active',
        endsAt: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          required: true
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return subscriptions;
  }

  /**
   * Convert subscription to free plan (when quota exhausted)
   * @param {number} subscriptionId - Subscription ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated subscription
   */
  async convertSubscriptionToFree(subscriptionId, userId) {
    const [affectedRows] = await UserSubscription.update(
      {
        status: 'expired',
        cancelledAt: new Date(),
        cancellationReason: 'Quota exhausted - auto-converted to free plan',
        autoRenew: false
      },
      {
        where: { 
          id: subscriptionId,
          userId 
        }
      }
    );

    if (affectedRows === 0) {
      throw new Error('Subscription not found or could not be updated');
    }

    return await UserSubscription.findByPk(subscriptionId);
  }

  /**
   * Get listings count by status for subscription
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Status counts
   */
  async getListingStatusCounts(subscriptionId) {
    const counts = await Listing.findAll({
      where: {
        userSubscriptionId: subscriptionId
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Convert to object format
    const statusCounts = {
      draft: 0,
      pending: 0,
      active: 0,
      expired: 0,
      sold: 0,
      rejected: 0
    };

    counts.forEach(item => {
      statusCounts[item.status] = parseInt(item.count);
    });

    return statusCounts;
  }

  /**
   * Check if user has auto-approve enabled
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Auto-approve status
   */
  async getUserAutoApproveStatus(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['isAutoApproveEnabled']
    });

    return user?.isAutoApproveEnabled || false;
  }
}

// Export singleton instance
export default new QuotaRepository();