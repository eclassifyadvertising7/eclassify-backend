/**
 * Quota Service
 * Business logic for quota management and consumption tracking
 */

import quotaRepository from "#repositories/quotaRepository.js";
import subscriptionRepository from "#repositories/subscriptionRepository.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "#utils/constants/messages.js";

class QuotaService {
  /**
   * Check quota availability for user in category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Quota availability result
   */
  async checkQuotaAvailability(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error("User ID and Category ID are required");
    }

    const quotaUsage = await quotaRepository.getUserQuotaUsage(
      userId,
      categoryId,
    );

    if (!quotaUsage) {
      throw new Error("No subscription plan found for this category");
    }

    const hasQuota = quotaUsage.quotaRemaining > 0;

    return {
      success: true,
      message: hasQuota ? "Quota available" : "Quota exhausted",
      data: {
        hasQuota,
        quotaUsage,
        canCreateListing: hasQuota,
      },
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
      throw new Error("User ID and Category ID are required");
    }

    const quotaUsage = await quotaRepository.getUserQuotaUsage(
      userId,
      categoryId,
    );

    if (!quotaUsage) {
      return {
        success: false,
        message: "No subscription plan found for this category",
        data: null,
      };
    }

    // Calculate additional details
    const quotaPercentage =
      quotaUsage.quotaLimit > 0
        ? Math.round((quotaUsage.quotaUsed / quotaUsage.quotaLimit) * 100)
        : 0;

    const isNearLimit = quotaPercentage >= 80;
    const isExhausted = quotaUsage.quotaRemaining === 0;

    let statusMessage = "Quota available";
    if (isExhausted) {
      statusMessage = "Quota exhausted";
    } else if (isNearLimit) {
      statusMessage = "Quota nearly exhausted";
    }

    return {
      success: true,
      message: statusMessage,
      data: {
        ...quotaUsage,
        quotaPercentage,
        isNearLimit,
        isExhausted,
        canCreateListing: !isExhausted,
      },
    };
  }

  /**
   * Check quota status for listing creation (lightweight response)
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Minimal quota status for frontend
   */
  async checkQuotaForListing(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error("User ID and Category ID are required");
    }

    const quotaUsage = await quotaRepository.getUserQuotaUsage(
      userId,
      categoryId,
    );

    if (!quotaUsage) {
      return {
        success: false,
        message: "No subscription plan found for this category",
        data: null,
      };
    }

    const quotaPercentage =
      quotaUsage.quotaLimit > 0
        ? Math.round((quotaUsage.quotaUsed / quotaUsage.quotaLimit) * 100)
        : 0;

    const isNearLimit = quotaPercentage >= 80;
    const isExhausted = quotaUsage.quotaRemaining === 0;

    let statusMessage = "Quota available";
    if (isExhausted) {
      statusMessage = "Quota exhausted";
    } else if (isNearLimit) {
      statusMessage = "Quota nearly exhausted";
    }

    const rollingDays = quotaUsage.rollingDays || 30;

    return {
      success: true,
      message: statusMessage,
      data: {
        canCreateListing: !isExhausted,
        hasQuota: !isExhausted,
        subscription: {
          planType: quotaUsage.planType,
          planName: quotaUsage.planName,
          status: quotaUsage.subscription?.status || "active",
          activatedAt: quotaUsage.subscription?.activatedAt || null,
          endsAt: quotaUsage.subscription?.endsAt || null,
        },
        quota: {
          used: quotaUsage.quotaUsed,
          limit: quotaUsage.quotaLimit,
          remaining: quotaUsage.quotaRemaining,
          rollingDays: rollingDays,
        },
        quotaPercentage,
        isNearLimit,
        isExhausted,
      },
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
      throw new Error("User ID, Category ID, and Listing ID are required");
    }

    const quotaCheck = await this.checkQuotaAvailability(userId, categoryId);

    if (!quotaCheck.data.hasQuota) {
      throw new Error("No quota available to consume");
    }

    const quotaUsage = quotaCheck.data.quotaUsage;
    let subscriptionId = null;
    let isPaidListing = false;

    // if (quotaUsage.planType === 'paid' && quotaUsage.subscription) {
    //   subscriptionId = quotaUsage.subscription.id;
    //   isPaidListing = true;
    // } else if (quotaUsage.planType === 'free' && quotaUsage.freePlan) {
    //   subscriptionId = null;
    //   isPaidListing = false;
    // }

    // Check if subscription exists (works for both free and paid plans)
    if (quotaUsage.subscription) {
      subscriptionId = quotaUsage.subscription.id;
      isPaidListing = quotaUsage.planType === "paid";
    } else {
      // This shouldn't happen if all users have subscriptions
      throw new Error("No active subscription found for user");
    }

    const updatedListing = await quotaRepository.updateListingQuotaTracking(
      listingId,
      subscriptionId,
      isPaidListing,
    );

    const wasAlreadyTracked =
      updatedListing.userSubscriptionId !== null &&
      updatedListing.userSubscriptionId !== subscriptionId;

    let actualQuotaRemaining;
    if (
      wasAlreadyTracked ||
      (updatedListing.userSubscriptionId !== null &&
        updatedListing.userSubscriptionId !== subscriptionId)
    ) {
      actualQuotaRemaining = quotaUsage.quotaRemaining;
    } else {
      actualQuotaRemaining = quotaUsage.quotaRemaining - 1;
    }

    if (quotaUsage.planType === "paid" && actualQuotaRemaining === 0) {
      await this.convertToFreePlan(
        userId,
        categoryId,
        quotaUsage.subscription.id,
      );
    }

    return {
      success: true,
      message: wasAlreadyTracked
        ? "Quota already consumed for this listing"
        : "Quota consumed successfully",
      data: {
        listingId,
        subscriptionId,
        isPaidListing,
        quotaRemaining: actualQuotaRemaining,
        wasAlreadyTracked,
      },
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
      throw new Error("User ID, Category ID, and Subscription ID are required");
    }

    // Convert the subscription to expired status
    await quotaRepository.convertSubscriptionToFree(subscriptionId, userId);

    // Get the free plan for this category
    const freePlan = await quotaRepository.getFreePlanForCategory(categoryId);

    if (!freePlan) {
      throw new Error("No free plan available for this category");
    }

    return {
      success: true,
      message: "Subscription converted to free plan due to quota exhaustion",
      data: {
        convertedSubscriptionId: subscriptionId,
        freePlan: {
          id: freePlan.id,
          name: freePlan.name,
          quotaLimit: freePlan.listingQuotaLimit,
          rollingDays: freePlan.listingQuotaRollingDays,
        },
      },
    };
  }

  /**
   * Get quota usage for all categories for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} All quota usage
   */
  async getAllQuotaStatus(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get all active subscriptions
    const subscriptions =
      await quotaRepository.getUserAllActiveSubscriptions(userId);

    const quotaStatuses = [];

    // Get quota status for each subscription's category
    for (const subscription of subscriptions) {
      if (subscription.plan?.categoryId) {
        try {
          const quotaStatus = await this.getQuotaStatus(
            userId,
            subscription.plan.categoryId,
          );
          if (quotaStatus.success) {
            quotaStatuses.push({
              categoryId: subscription.plan.categoryId,
              categoryName: subscription.plan.category?.name || "Unknown",
              ...quotaStatus.data,
            });
          }
        } catch (error) {
          // Continue with other categories if one fails
          console.error(
            `Error getting quota for category ${subscription.plan.categoryId}:`,
            error,
          );
        }
      }
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        quotaStatuses,
        totalCategories: quotaStatuses.length,
      },
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
      throw new Error("Subscription and feature type are required");
    }

    const validFeatures = ["boost", "spotlight", "homepage", "featured"];
    if (!validFeatures.includes(featureType)) {
      throw new Error(
        `Invalid feature type. Must be one of: ${validFeatures.join(", ")}`,
      );
    }

    const featureDaysField = `${featureType}Days`;
    const featureDays = subscription[featureDaysField] || 0;

    if (featureDays === 0) {
      return {
        success: false,
        message: `${featureType} feature not available in this plan`,
        data: null,
      };
    }

    const activatedAt = new Date(subscription.activatedAt);
    const expiresAt = new Date(activatedAt);
    expiresAt.setDate(expiresAt.getDate() + featureDays);

    const now = new Date();
    const isExpired = now > expiresAt;
    const daysRemaining = isExpired
      ? 0
      : Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      message: isExpired
        ? `${featureType} feature expired`
        : `${featureType} feature active`,
      data: {
        featureType,
        featureDays,
        activatedAt,
        expiresAt,
        isExpired,
        daysRemaining,
        isActive: !isExpired,
      },
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
      throw new Error("User ID and Category ID are required");
    }

    // Check quota availability
    const quotaCheck = await this.checkQuotaAvailability(userId, categoryId);

    if (!quotaCheck.data.hasQuota) {
      return {
        success: false,
        message: "Cannot create listing: quota exhausted",
        data: {
          canCreate: false,
          reason: "quota_exhausted",
          suggestedAction: "upgrade_plan",
          quotaUsage: quotaCheck.data.quotaUsage,
        },
      };
    }

    // Check user's auto-approve status
    const hasAutoApprove =
      await quotaRepository.getUserAutoApproveStatus(userId);

    return {
      success: true,
      message: "User can create listing",
      data: {
        canCreate: true,
        hasQuota: true,
        hasAutoApprove,
        suggestedStatus: hasAutoApprove ? "active" : "pending",
        quotaUsage: quotaCheck.data.quotaUsage,
      },
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
      },
    };
  }
}

// Export singleton instance
export default new QuotaService();
