/**
 * Subscription Quota Helper
 * Utilities for checking user subscription limits and quotas
 */

import { Op } from 'sequelize';
import models from '#models/index.js';

const { Listing, UserSubscription } = models;

/**
 * Statuses that count towards quota
 * - active: Currently live listing
 * - expired: Was published but expired (consumed quota)
 * - sold: Was published and marked sold (consumed quota)
 * 
 * Excluded statuses:
 * - draft: Not yet submitted
 * - pending: Awaiting approval (not published yet)
 * - rejected: Never published
 */
const QUOTA_COUNTED_STATUSES = ['active', 'expired', 'sold'];

/**
 * Get user's active subscription with quota details
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Active subscription or null
 */
export const getUserActiveSubscription = async (userId) => {
  const subscription = await UserSubscription.findOne({
    where: {
      userId,
      status: 'active',
      startsAt: { [Op.lte]: new Date() },
      endsAt: { [Op.gte]: new Date() }
    },
    order: [['created_at', 'DESC']]
  });

  return subscription;
};

/**
 * Count user's listings that consume quota
 * Includes soft-deleted listings to prevent quota gaming
 * 
 * @param {number} userId - User ID
 * @param {Object} options - Optional filters
 * @param {Date} options.since - Count listings created after this date (for rolling quotas)
 * @param {boolean} options.activeOnly - Count only active listings (default: false)
 * @returns {Promise<number>} Count of listings
 */
export const countUserListings = async (userId, options = {}) => {
  const { since, activeOnly = false } = options;

  const whereClause = {
    userId,
    status: activeOnly ? 'active' : { [Op.in]: QUOTA_COUNTED_STATUSES }
  };

  // For rolling quota checks
  if (since) {
    whereClause.created_at = { [Op.gte]: since };
  }

  const count = await Listing.count({
    where: whereClause,
    paranoid: false // Include soft-deleted listings
  });

  return count;
};

/**
 * Check if user can create a new listing based on subscription quotas
 * Uses rolling quota system (listingQuotaLimit within listingQuotaRollingDays)
 * 
 * @param {number} userId - User ID
 * @param {Object} options - Options
 * @param {boolean} options.thirdPerson - Use third-person messaging (for admin context)
 * @returns {Promise<Object>} Result object with canCreate flag and details
 */
export const canUserCreateListing = async (userId, options = {}) => {
  const { thirdPerson = false } = options;
  
  // Get active subscription
  const subscription = await getUserActiveSubscription(userId);

  if (!subscription) {
    return {
      canCreate: false,
      reason: 'NO_ACTIVE_SUBSCRIPTION',
      message: thirdPerson 
        ? 'User does not have an active subscription to create listings'
        : 'You need an active subscription to create listings',
      details: null
    };
  }

  // Check rolling quota (primary quota mechanism)
  if (!subscription.listingQuotaLimit || !subscription.listingQuotaRollingDays) {
    return {
      canCreate: false,
      reason: 'INVALID_SUBSCRIPTION_PLAN',
      message: thirdPerson
        ? 'User subscription plan does not have listing quota configured'
        : 'Your subscription plan does not have listing quota configured',
      details: null
    };
  }

  const rollingStartDate = new Date();
  rollingStartDate.setDate(rollingStartDate.getDate() - subscription.listingQuotaRollingDays);

  const rollingCount = await countUserListings(userId, { since: rollingStartDate });

  if (rollingCount >= subscription.listingQuotaLimit) {
    return {
      canCreate: false,
      reason: 'ROLLING_QUOTA_REACHED',
      message: thirdPerson
        ? `User has reached their ${subscription.listingQuotaRollingDays}-day listing limit (${subscription.listingQuotaLimit})`
        : `You have reached your ${subscription.listingQuotaRollingDays}-day listing limit (${subscription.listingQuotaLimit})`,
      details: {
        current: rollingCount,
        limit: subscription.listingQuotaLimit,
        rollingDays: subscription.listingQuotaRollingDays,
        remaining: 0
      }
    };
  }

  // All checks passed
  return {
    canCreate: true,
    reason: 'QUOTA_AVAILABLE',
    message: thirdPerson
      ? 'User can create a new listing'
      : 'You can create a new listing',
    details: {
      subscription: {
        planName: subscription.planName,
        endsAt: subscription.endsAt
      },
      quota: {
        current: rollingCount,
        limit: subscription.listingQuotaLimit,
        remaining: subscription.listingQuotaLimit - rollingCount,
        rollingDays: subscription.listingQuotaRollingDays,
        percentage: Math.round((rollingCount / subscription.listingQuotaLimit) * 100)
      }
    }
  };
};

/**
 * Get user's quota usage summary
 * Useful for displaying quota info in UI
 * Uses rolling quota system only
 * 
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Quota usage details
 */
export const getUserQuotaUsage = async (userId) => {
  const subscription = await getUserActiveSubscription(userId);

  if (!subscription) {
    return {
      hasSubscription: false,
      message: 'No active subscription'
    };
  }

  if (!subscription.listingQuotaLimit || !subscription.listingQuotaRollingDays) {
    return {
      hasSubscription: true,
      message: 'Subscription plan does not have listing quota configured',
      subscription: {
        planName: subscription.planName,
        planCode: subscription.planCode,
        status: subscription.status,
        startsAt: subscription.startsAt,
        endsAt: subscription.endsAt
      },
      quota: null
    };
  }

  const rollingStartDate = new Date();
  rollingStartDate.setDate(rollingStartDate.getDate() - subscription.listingQuotaRollingDays);
  const rollingCount = await countUserListings(userId, { since: rollingStartDate });

  return {
    hasSubscription: true,
    subscription: {
      planName: subscription.planName,
      planCode: subscription.planCode,
      status: subscription.status,
      startsAt: subscription.startsAt,
      endsAt: subscription.endsAt
    },
    quota: {
      used: rollingCount,
      limit: subscription.listingQuotaLimit,
      remaining: Math.max(0, subscription.listingQuotaLimit - rollingCount),
      rollingDays: subscription.listingQuotaRollingDays,
      percentage: Math.round((rollingCount / subscription.listingQuotaLimit) * 100),
      windowStart: rollingStartDate,
      windowEnd: new Date()
    }
  };
};

export default {
  getUserActiveSubscription,
  countUserListings,
  canUserCreateListing,
  getUserQuotaUsage,
  QUOTA_COUNTED_STATUSES
};
