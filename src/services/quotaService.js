/**
 * Quota Service
 * Business logic for quota management and consumption tracking
 */

import quotaRepository from '#repositories/quotaRepository.js';
import subscriptionRepository from '#repositories/subscriptionRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class QuotaService {
  /**
   * Check quota availability for user in category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Quota availability result
   */
  async checkQuotaAvailability(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error('User ID and Category ID are required');
    }

    console.log(`[QUOTA] ========== checkQuotaAvailability START ==========`);
    console.log(`[QUOTA] Input: userId=${userId}, categoryId=${categoryId}`);
    
    const quotaUsage = await quotaRepository.getUserQuotaUsage(userId, categoryId);
    console.log(`[QUOTA] quotaUsage from repository:`, JSON.stringify(quotaUsage, null, 2));

    if (!quotaUsage) {
      console.log(`[QUOTA] ERROR: No subscription plan found`);
      throw new Error('No subscription plan found for this category');
    }

    const hasQuota = quotaUsage.quotaRemaining > 0;
    console.log(`[QUOTA] Calculation: quotaRemaining=${quotaUsage.quotaRemaining}, hasQuota=${hasQuota}`);
    console.log(`[QUOTA] quotaLimit=${quotaUsage.quotaLimit}, quotaUsed=${quotaUsage.quotaUsed}`);
    console.log(`[QUOTA] ========== checkQuotaAvailability END ==========`);

    return {
      success: true,
      message: hasQuota ? 'Quota available' : 'Quota exhausted',
      data: {
        hasQuota,
        quotaUsage,
        canCreateListing: hasQuota
      }
    };
  }

  /**
   * Get detailed quota status for user in category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Detailed quota status
   */
  async getQuotaStatus(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error('User ID and Category ID are required');
    }

    const quotaUsage = await quotaRepository.getUserQuotaUsage(userId, categoryId);

    if (!quotaUsage) {
      return {
        success: false,
        message: 'No subscription plan found for this category',
        data: null
      };
    }

    // Calculate additional details
    const quotaPercentage = quotaUsage.quotaLimit > 0 
      ? Math.round((quotaUsage.quotaUsed / quotaUsage.quotaLimit) * 100)
      : 0;

    const isNearLimit = quotaPercentage >= 80;
    const isExhausted = quotaUsage.quotaRemaining === 0;

    let statusMessage = 'Quota available';
    if (isExhausted) {
      statusMessage = 'Quota exhausted';
    } else if (isNearLimit) {
      statusMessage = 'Quota nearly exhausted';
    }

    return {
      success: true,
      message: statusMessage,
      data: {
        ...quotaUsage,
        quotaPercentage,
        isNearLimit,
        isExhausted,
        canCreateListing: !isExhausted
      }
    };
  }

  /**
   * Consume quota when listing is created/approved
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Consumption result
   */
  async consumeQuota(userId, categoryId, listingId) {
    if (!userId || !categoryId || !listingId) {
      throw new Error('User ID, Category ID, and Listing ID are required');
    }

    console.log(`[QUOTA] ========== consumeQuota START ==========`);
    console.log(`[QUOTA] Input: userId=${userId}, categoryId=${categoryId}, listingId=${listingId}`);

    // Check current quota status
    const quotaCheck = await this.checkQuotaAvailability(userId, categoryId);
    console.log(`[QUOTA] quotaCheck result:`, JSON.stringify(quotaCheck, null, 2));
    
    if (!quotaCheck.data.hasQuota) {
      console.log(`[QUOTA] ERROR: No quota available to consume`);
      throw new Error('No quota available to consume');
    }

    const quotaUsage = quotaCheck.data.quotaUsage;
    let subscriptionId = null;
    let isPaidListing = false;

    console.log(`[QUOTA] planType=${quotaUsage.planType}`);

    if (quotaUsage.planType === 'paid' && quotaUsage.subscription) {
      subscriptionId = quotaUsage.subscription.id;
      isPaidListing = true;
      console.log(`[QUOTA] Paid plan: subscriptionId=${subscriptionId}`);
    } else if (quotaUsage.planType === 'free' && quotaUsage.freePlan) {
      // For free plans, we don't track subscription ID but still track the listing
      subscriptionId = null;
      isPaidListing = false;
      console.log(`[QUOTA] Free plan: no subscriptionId`);
    }

    // Update listing with subscription tracking
    console.log(`[QUOTA] Updating listing quota tracking...`);
    await quotaRepository.updateListingQuotaTracking(
      listingId, 
      subscriptionId, 
      isPaidListing
    );
    console.log(`[QUOTA] Listing quota tracking updated`);

    // Check if paid plan quota is now exhausted
    if (quotaUsage.planType === 'paid' && quotaUsage.quotaRemaining === 1) {
      console.log(`[QUOTA] Last quota consumed, converting to free plan...`);
      // This was the last quota, convert to free plan
      await this.convertToFreePlan(userId, categoryId, quotaUsage.subscription.id);
    }

    const newQuotaRemaining = quotaUsage.quotaRemaining - 1;
    console.log(`[QUOTA] Quota consumed: quotaRemaining=${quotaUsage.quotaRemaining} -> ${newQuotaRemaining}`);
    console.log(`[QUOTA] ========== consumeQuota END ==========`);

    return {
      success: true,
      message: 'Quota consumed successfully',
      data: {
        listingId,
        subscriptionId,
        isPaidListing,
        quotaRemaining: newQuotaRemaining
      }
    };
  }

  /**
   * Convert paid subscription to free plan when quota exhausted
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @param {number} subscriptionId - Subscription ID to convert
   * @returns {Promise<Object>} Conversion result
   */
  async convertToFreePlan(userId, categoryId, subscriptionId) {
    if (!userId || !categoryId || !subscriptionId) {
      throw new Error('User ID, Category ID, and Subscription ID are required');
    }

    // Convert the subscription to expired status
    await quotaRepository.convertSubscriptionToFree(subscriptionId, userId);

    // Get the free plan for this category
    const freePlan = await quotaRepository.getFreePlanForCategory(categoryId);

    if (!freePlan) {
      throw new Error('No free plan available for this category');
    }

    return {
      success: true,
      message: 'Subscription converted to free plan due to quota exhaustion',
      data: {
        convertedSubscriptionId: subscriptionId,
        freePlan: {
          id: freePlan.id,
          name: freePlan.name,
          quotaLimit: freePlan.listingQuotaLimit,
          rollingDays: freePlan.listingQuotaRollingDays
        }
      }
    };
  }

  /**
   * Get quota usage for all categories for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} All quota usage
   */
  async getAllQuotaStatus(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get all active subscriptions
    const subscriptions = await quotaRepository.getUserAllActiveSubscriptions(userId);
    
    const quotaStatuses = [];

    // Get quota status for each subscription's category
    for (const subscription of subscriptions) {
      if (subscription.plan?.categoryId) {
        try {
          const quotaStatus = await this.getQuotaStatus(userId, subscription.plan.categoryId);
          if (quotaStatus.success) {
            quotaStatuses.push({
              categoryId: subscription.plan.categoryId,
              categoryName: subscription.plan.category?.name || 'Unknown',
              ...quotaStatus.data
            });
          }
        } catch (error) {
          // Continue with other categories if one fails
          console.error(`Error getting quota for category ${subscription.plan.categoryId}:`, error);
        }
      }
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        quotaStatuses,
        totalCategories: quotaStatuses.length
      }
    };
  }

  /**
   * Calculate feature expiry dates for subscription
   * @param {Object} subscription - Subscription object
   * @param {string} featureType - Feature type (boost, spotlight, homepage, featured)
   * @returns {Promise<Object>} Feature expiry calculation
   */
  async calculateFeatureExpiry(subscription, featureType) {
    if (!subscription || !featureType) {
      throw new Error('Subscription and feature type are required');
    }

    const validFeatures = ['boost', 'spotlight', 'homepage', 'featured'];
    if (!validFeatures.includes(featureType)) {
      throw new Error(`Invalid feature type. Must be one of: ${validFeatures.join(', ')}`);
    }

    const featureDaysField = `${featureType}Days`;
    const featureDays = subscription[featureDaysField] || 0;

    if (featureDays === 0) {
      return {
        success: false,
        message: `${featureType} feature not available in this plan`,
        data: null
      };
    }

    const activatedAt = new Date(subscription.activatedAt);
    const expiresAt = new Date(activatedAt);
    expiresAt.setDate(expiresAt.getDate() + featureDays);

    const now = new Date();
    const isExpired = now > expiresAt;
    const daysRemaining = isExpired ? 0 : Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      message: isExpired ? `${featureType} feature expired` : `${featureType} feature active`,
      data: {
        featureType,
        featureDays,
        activatedAt,
        expiresAt,
        isExpired,
        daysRemaining,
        isActive: !isExpired
      }
    };
  }

  /**
   * Check if user can create listing (quota + auto-approve logic)
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Creation eligibility result
   */
  async checkListingEligibility(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error('User ID and Category ID are required');
    }

    console.log(`[QUOTA] ========== checkListingEligibility START ==========`);
    console.log(`[QUOTA] Input: userId=${userId}, categoryId=${categoryId}`);

    // Check quota availability
    const quotaCheck = await this.checkQuotaAvailability(userId, categoryId);
    console.log(`[QUOTA] quotaCheck result:`, JSON.stringify(quotaCheck, null, 2));
    
    if (!quotaCheck.data.hasQuota) {
      console.log(`[QUOTA] ELIGIBILITY DENIED: No quota available`);
      console.log(`[QUOTA] ========== checkListingEligibility END (DENIED) ==========`);
      return {
        success: false,
        message: 'Cannot create listing: quota exhausted',
        data: {
          canCreate: false,
          reason: 'quota_exhausted',
          suggestedAction: 'upgrade_plan',
          quotaUsage: quotaCheck.data.quotaUsage
        }
      };
    }

    // Check user's auto-approve status
    const hasAutoApprove = await quotaRepository.getUserAutoApproveStatus(userId);
    console.log(`[QUOTA] hasAutoApprove=${hasAutoApprove}`);

    console.log(`[QUOTA] ELIGIBILITY GRANTED: canCreate=true, hasQuota=true`);
    console.log(`[QUOTA] ========== checkListingEligibility END (GRANTED) ==========`);

    return {
      success: true,
      message: 'User can create listing',
      data: {
        canCreate: true,
        hasQuota: true,
        hasAutoApprove,
        suggestedStatus: hasAutoApprove ? 'active' : 'pending',
        quotaUsage: quotaCheck.data.quotaUsage
      }
    };
  }

  /**
   * Get quota statistics for admin dashboard
   * @param {Object} filters - Filter options (categoryId, dateRange, etc.)
   * @returns {Promise<Object>} Quota statistics
   */
  async getQuotaStatistics(filters = {}) {
    // This would be implemented for admin dashboard
    // For now, return basic structure
    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        totalUsers: 0,
        usersWithActiveSubscriptions: 0,
        usersOnFreePlans: 0,
        quotaUtilizationRate: 0,
        // More statistics would be added here
      }
    };
  }
}

// Export singleton instance
export default new QuotaService();