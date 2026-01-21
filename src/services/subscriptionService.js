import subscriptionRepository from "#repositories/subscriptionRepository.js";
import invoiceRepository from "#repositories/invoiceRepository.js";
import transactionRepository from "#repositories/transactionRepository.js";
import quotaService from "#services/quotaService.js";
import quotaRepository from "#repositories/quotaRepository.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "#utils/constants/messages.js";
import { customSlugify } from "#utils/customSlugify.js";
import db, { sequelize } from "#models/index.js";

/**
 * SubscriptionService - Business logic for subscription management
 * Singleton pattern for consistent instance usage
 */
class SubscriptionService {
  // Critical fields that require new version when changed
  CRITICAL_FIELDS = [
    // Pricing (5 fields)
    "basePrice",
    "discountAmount",
    "finalPrice",
    "billingCycle",
    "durationDays",
    // Listing Quotas (4 fields)
    "maxTotalListings",
    "maxActiveListings",
    "listingQuotaLimit",
    "listingQuotaRollingDays",
    // Featured & Promotional (7 fields)
    "maxFeaturedListings",
    "maxBoostedListings",
    "maxSpotlightListings",
    "maxHomepageListings",
    "featuredDays",
    "boostedDays",
    "spotlightDays",
    // Listing Management (4 fields)
    "listingDurationDays",
    "autoRenewal",
    "maxRenewals",
    "supportLevel",
  ];

  // ==================== SUPER ADMIN OPERATIONS ====================

  /**
   * Create new subscription plan
   * @param {Object} planData - Plan data
   * @param {number} userId - Creator user ID
   * @param {string} userName - Creator user name
   * @returns {Promise<Object>} Service response
   */
  async createPlan(planData, userId, userName) {
    // Validate required fields
    if (!planData.planCode || planData.planCode.trim().length < 2) {
      throw new Error("Plan code must be at least 2 characters");
    }

    if (!planData.name || planData.name.trim().length < 3) {
      throw new Error("Plan name must be at least 3 characters");
    }

    if (planData.basePrice === undefined || planData.basePrice < 0) {
      throw new Error("Base price is required and must be non-negative");
    }

    if (planData.finalPrice === undefined || planData.finalPrice < 0) {
      throw new Error("Final price is required and must be non-negative");
    }

    if (!planData.durationDays || planData.durationDays < 1) {
      throw new Error("Duration days must be at least 1");
    }

    // Auto-generate slug from name if not provided
    let slug = planData.slug;
    if (!slug || slug.trim().length === 0) {
      slug = customSlugify(planData.name);
    }

    // Check if slug already exists, if so append version
    let finalSlug = slug;
    let slugExists = await subscriptionRepository.slugExists(finalSlug);

    if (slugExists) {
      // Try with -v1 suffix
      finalSlug = `${slug}-v1`;
      slugExists = await subscriptionRepository.slugExists(finalSlug);

      if (slugExists) {
        throw new Error(
          `Slug "${slug}" and "${finalSlug}" already exist. Please provide a unique slug.`
        );
      }
    }

    // Set defaults
    const planToCreate = {
      ...planData,
      slug: finalSlug,
      version: 1,
      discountAmount: planData.discountAmount || 0,
      currency: planData.currency || "INR",
      sortOrder: planData.sortOrder || 0,
      isActive: planData.isActive !== undefined ? planData.isActive : true,
      isPublic: planData.isPublic !== undefined ? planData.isPublic : true,
      isDefault: planData.isDefault || false,
      isFeatured: planData.isFeatured || false,
      isSystemPlan: planData.isSystemPlan || false,
      features: planData.features || {},
      availableAddons: planData.availableAddons || [],
      upsellSuggestions: planData.upsellSuggestions || {},
      metadata: planData.metadata || {},
    };

    const plan = await subscriptionRepository.createPlan(
      planToCreate,
      userId,
      userName
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.SUBSCRIPTION_PLAN_CREATED,
      data: plan,
    };
  }

  /**
   * Update subscription plan (auto-detects if version needed)
   * @param {number} planId - Plan ID
   * @param {Object} updateData - Update data
   * @param {number} userId - Updater user ID
   * @param {string} userName - Updater user name
   * @returns {Promise<Object>} Service response
   */
  async updatePlan(planId, updateData, userId, userName) {
    const existingPlan = await subscriptionRepository.findPlanById(planId);

    if (!existingPlan) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    // Check if any critical field is being changed
    const hasCriticalChanges = this._hasCriticalFieldChanges(
      existingPlan,
      updateData
    );

    if (hasCriticalChanges) {
      // Auto-create new version (slug will be auto-generated in _createNewVersion)
      return await this._createNewVersion(
        existingPlan,
        updateData,
        userId,
        userName
      );
    } else {
      // Non-critical update - keep existing slug, don't allow slug changes
      if (updateData.slug && updateData.slug !== existingPlan.slug) {
        throw new Error(
          "Cannot change slug during non-critical update. Slug changes only allowed when creating new version."
        );
      }

      // Remove slug from updateData to prevent accidental changes
      const { slug, ...safeUpdateData } = updateData;

      // Safe to update in place
      const updatedPlan = await subscriptionRepository.updatePlan(
        planId,
        safeUpdateData,
        userId,
        userName
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.SUBSCRIPTION_PLAN_UPDATED,
        data: updatedPlan,
      };
    }
  }

  /**
   * Get all plans (admin view)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Service response
   */
  async getAllPlans(filters = {}) {
    const plans = await subscriptionRepository.getAllPlans(filters);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: plans,
    };
  }

  /**
   * Get plan by ID
   * @param {number} planId - Plan ID
   * @returns {Promise<Object>} Service response
   */
  async getPlanById(planId) {
    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: plan,
    };
  }

  /**
   * Delete plan (soft delete)
   * @param {number} planId - Plan ID
   * @param {number} userId - Deleter user ID
   * @returns {Promise<Object>} Service response
   */
  async deletePlan(planId, userId) {
    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    if (plan.isSystemPlan) {
      throw new Error("Cannot delete system plan");
    }

    // Check if plan has active subscriptions
    const activeSubscriptions =
      await subscriptionRepository.countActiveSubscriptionsForPlan(planId);
    if (activeSubscriptions > 0) {
      throw new Error(
        `Cannot delete plan with ${activeSubscriptions} active subscriptions`
      );
    }

    await subscriptionRepository.deletePlan(planId, userId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.SUBSCRIPTION_PLAN_DELETED,
      data: null,
    };
  }

  /**
   * Update plan status
   * @param {number} planId - Plan ID
   * @param {boolean} isActive - New status
   * @param {number} userId - Updater user ID
   * @param {string} userName - Updater user name
   * @returns {Promise<Object>} Service response
   */
  async updatePlanStatus(planId, isActive, userId, userName) {
    if (typeof isActive !== "boolean") {
      throw new Error("isActive must be a boolean value");
    }

    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    const updatedPlan = await subscriptionRepository.updatePlan(
      planId,
      { isActive },
      userId,
      userName
    );

    return {
      success: true,
      message: `Plan ${isActive ? "activated" : "deactivated"} successfully`,
      data: updatedPlan,
    };
  }

  /**
   * Update plan visibility
   * @param {number} planId - Plan ID
   * @param {boolean} isPublic - New visibility
   * @param {number} userId - Updater user ID
   * @param {string} userName - Updater user name
   * @returns {Promise<Object>} Service response
   */
  async updatePlanVisibility(planId, isPublic, userId, userName) {
    if (typeof isPublic !== "boolean") {
      throw new Error("isPublic must be a boolean value");
    }

    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    const updatedPlan = await subscriptionRepository.updatePlan(
      planId,
      { isPublic },
      userId,
      userName
    );

    return {
      success: true,
      message: `Plan visibility ${
        isPublic ? "enabled" : "disabled"
      } successfully`,
      data: updatedPlan,
    };
  }

  // ==================== END USER OPERATIONS ====================

  /**
   * Get available plans for end users
   * @returns {Promise<Object>} Service response
   */
  async getAvailablePlans() {
    const plans = await subscriptionRepository.getActivePublicPlans();

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: plans,
    };
  }

  /**
   * Get plans by category - For listing subscriptions
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Service response
   */
  async getPlansByCategory(categoryId) {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const plans = await subscriptionRepository.getPlansByCategory(categoryId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: plans,
    };
  }

  /**
   * Get plan details (public view)
   * @param {number} planId - Plan ID
   * @returns {Promise<Object>} Service response
   */
  async getPlanDetails(planId) {
    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    if (!plan.isActive || !plan.isPublic) {
      throw new Error("Plan is not available");
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: plan,
    };
  }

  /**
   * Check subscription eligibility before purchase
   * @param {number} userId - User ID
   * @param {number} planId - Plan ID
   * @returns {Promise<Object>} Service response with eligibility details
   */
  async checkSubscriptionEligibility(userId, planId) {
    try {
      const targetPlan = await subscriptionRepository.findPlanById(planId);

      if (!targetPlan) {
        return {
          success: true,
          message: 'Plan not found',
          data: {
            eligible: false,
            reason: 'PLAN_NOT_FOUND',
            message: 'The selected plan does not exist',
            targetPlan: null,
            currentSubscription: null,
            quotaInfo: null,
            suggestions: ['Please select a valid plan']
          }
        };
      }

      if (!targetPlan.isActive || !targetPlan.isPublic) {
        return {
          success: true,
          message: 'Plan not available',
          data: {
            eligible: false,
            reason: 'PLAN_NOT_AVAILABLE',
            message: 'This plan is not currently available for subscription',
            targetPlan: {
              id: targetPlan.id,
              name: targetPlan.name,
              isActive: targetPlan.isActive,
              isPublic: targetPlan.isPublic
            },
            currentSubscription: null,
            quotaInfo: null,
            suggestions: ['Please select an available plan']
          }
        };
      }

      const pendingSubscription = await subscriptionRepository.getUserPendingSubscriptionByCategory(
        userId,
        targetPlan.categoryId
      );

      if (pendingSubscription) {
        return {
          success: true,
          message: 'You have a pending subscription awaiting approval',
          data: {
            eligible: false,
            reason: 'PENDING_SUBSCRIPTION_EXISTS',
            message: 'You have a pending subscription for this category. Please wait for admin approval or cancel it to subscribe to a different plan.',
            targetPlan: {
              id: targetPlan.id,
              name: targetPlan.name,
              price: targetPlan.finalPrice,
              isFreePlan: targetPlan.isFreePlan,
              categoryId: targetPlan.categoryId
            },
            pendingSubscription: {
              id: pendingSubscription.id,
              planName: pendingSubscription.planName,
              submittedAt: pendingSubscription.createdAt,
              status: 'pending',
              paymentMethod: pendingSubscription.paymentMethod
            },
            currentSubscription: null,
            quotaInfo: null,
            suggestions: [
              'Wait for admin to approve your pending subscription',
              'Cancel your pending subscription to subscribe to a different plan',
              'Contact support for assistance'
            ]
          }
        };
      }

      const quotaUsage = await quotaRepository.getUserQuotaUsage(
        userId,
        targetPlan.categoryId
      );

      const existingSubscription = quotaUsage?.subscription;

      const eligibilityResult = this._evaluateEligibility(
        targetPlan,
        existingSubscription,
        quotaUsage
      );

      return {
        success: true,
        message: eligibilityResult.eligible 
          ? 'You are eligible to subscribe to this plan' 
          : eligibilityResult.message,
        data: eligibilityResult
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Evaluate subscription eligibility based on rules
   * @param {Object} targetPlan - Target plan to subscribe to
   * @param {Object} existingSubscription - Current subscription (if any)
   * @param {Object} quotaUsage - Current quota usage data
   * @returns {Object} Eligibility result
   * @private
   */
  _evaluateEligibility(targetPlan, existingSubscription, quotaUsage) {
    const targetPlanInfo = {
      id: targetPlan.id,
      name: targetPlan.name,
      price: targetPlan.finalPrice,
      isFreePlan: targetPlan.isFreePlan,
      categoryId: targetPlan.categoryId
    };

    if (!existingSubscription) {
      return {
        eligible: true,
        reason: 'NEW_SUBSCRIPTION',
        message: 'You can subscribe to this plan',
        targetPlan: targetPlanInfo,
        currentSubscription: null,
        quotaInfo: quotaUsage,
        suggestions: null
      };
    }

    const currentSubscriptionInfo = {
      id: existingSubscription.id,
      planName: existingSubscription.planName,
      isFreePlan: existingSubscription.isFreePlan,
      quotaLimit: quotaUsage?.quotaLimit || 0,
      quotaUsed: quotaUsage?.quotaUsed || 0,
      quotaRemaining: quotaUsage?.quotaRemaining || 0,
      rollingDays: quotaUsage?.rollingDays || 30
    };

    if (targetPlan.isFreePlan) {
      if (existingSubscription.isFreePlan) {
        return {
          eligible: false,
          reason: 'ALREADY_HAS_FREE_PLAN',
          message: 'You already have an active free plan for this category',
          targetPlan: targetPlanInfo,
          currentSubscription: currentSubscriptionInfo,
          quotaInfo: quotaUsage,
          suggestions: [
            'You can upgrade to a paid plan anytime',
            'Your current free plan will be replaced upon upgrade'
          ]
        };
      }

      if (!existingSubscription.isFreePlan) {
        const quotaExhausted = (quotaUsage?.quotaRemaining || 0) === 0;

        if (!quotaExhausted) {
          return {
            eligible: false,
            reason: 'QUOTA_NOT_EXHAUSTED',
            message: `Cannot downgrade to free plan. You have used ${quotaUsage.quotaUsed} of ${quotaUsage.quotaLimit} listings. Please exhaust your current quota first.`,
            targetPlan: targetPlanInfo,
            currentSubscription: currentSubscriptionInfo,
            quotaInfo: quotaUsage,
            suggestions: [
              `Create ${quotaUsage.quotaRemaining} more listings to exhaust your quota`,
              `Your quota resets ${quotaUsage.rollingDays} days after each listing creation`,
              'Wait for your subscription to expire',
              'Contact support for assistance'
            ]
          };
        }

        return {
          eligible: true,
          reason: 'DOWNGRADE_ALLOWED',
          message: 'You can downgrade to free plan (quota exhausted)',
          targetPlan: targetPlanInfo,
          currentSubscription: currentSubscriptionInfo,
          quotaInfo: quotaUsage,
          suggestions: null
        };
      }
    }

    if (!targetPlan.isFreePlan && existingSubscription.isFreePlan) {
      return {
        eligible: true,
        reason: 'FREE_PLAN_UPGRADE',
        message: 'You can upgrade from free plan anytime',
        targetPlan: targetPlanInfo,
        currentSubscription: currentSubscriptionInfo,
        quotaInfo: quotaUsage,
        suggestions: null
      };
    }

    if (!targetPlan.isFreePlan && !existingSubscription.isFreePlan) {
      const quotaExhausted = (quotaUsage?.quotaRemaining || 0) === 0;

      if (!quotaExhausted) {
        return {
          eligible: false,
          reason: 'QUOTA_NOT_EXHAUSTED',
          message: `Cannot upgrade. You have used ${quotaUsage.quotaUsed} of ${quotaUsage.quotaLimit} listings. Please exhaust your current quota before upgrading.`,
          targetPlan: targetPlanInfo,
          currentSubscription: currentSubscriptionInfo,
          quotaInfo: quotaUsage,
          suggestions: [
            `Create ${quotaUsage.quotaRemaining} more listings to exhaust your quota`,
            `Your quota resets ${quotaUsage.rollingDays} days after each listing creation`,
            'Contact support if you need immediate upgrade'
          ]
        };
      }

      return {
        eligible: true,
        reason: 'UPGRADE_ALLOWED',
        message: 'You can upgrade to this plan (quota exhausted)',
        targetPlan: targetPlanInfo,
        currentSubscription: currentSubscriptionInfo,
        quotaInfo: quotaUsage,
        suggestions: null
      };
    }

    return {
      eligible: false,
      reason: 'UNKNOWN',
      message: 'Unable to determine eligibility',
      targetPlan: targetPlanInfo,
      currentSubscription: currentSubscriptionInfo,
      quotaInfo: quotaUsage,
      suggestions: ['Contact support for assistance']
    };
  }

  /**
   * Subscribe user to plan with payment gateway
   * @param {number} userId - User ID
   * @param {number} planId - Plan ID
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Service response
   */
  async subscribeToPlan(userId, planId, paymentData = {}) {
    const transaction = await sequelize.transaction();

    try {
      // Get plan details first
      const plan = await subscriptionRepository.findPlanById(planId);

      if (!plan) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
      }

      const pendingSubscription = await subscriptionRepository.getUserPendingSubscriptionByCategory(
        userId,
        plan.categoryId
      );

      if (pendingSubscription) {
        throw new Error(
          'You have a pending subscription for this category. Please wait for admin approval or cancel it to subscribe to a different plan.'
        );
      }

      // Check if user already has active subscription for this plan's category
      const existingCategorySubscription =
        await subscriptionRepository.getUserActiveSubscriptionByCategory(
          userId,
          plan.categoryId
        );
      
      if (existingCategorySubscription) {
        // If user has free plan, allow upgrade without quota check
        if (existingCategorySubscription.isFreePlan) {
          // Free plan user can upgrade anytime - no quota check needed
        } else {
          // Paid plan user - check if quota is exhausted
          const { Listing } = db;
          const listingCount = await Listing.count({
            where: {
              userId,
              userSubscriptionId: existingCategorySubscription.id,
              status: {
                [db.Sequelize.Op.in]: ['pending', 'active', 'sold', 'expired']
              }
            }
          });

          // If quota not exhausted, don't allow upgrade
          if (listingCount < existingCategorySubscription.listingQuotaLimit) {
            throw new Error(
              `Cannot upgrade. You have used ${listingCount} of ${existingCategorySubscription.listingQuotaLimit} listings. Please exhaust your current quota before upgrading.`
            );
          }
        }
      }

      // Special validation for free plan subscriptions
      if (plan.isFreePlan) {
        // Check if user already has active free plan for this category
        if (existingCategorySubscription && existingCategorySubscription.isFreePlan) {
          throw new Error('You already have an active free plan for this category');
        }

        // Check if user has exhausted quota (if they have a paid plan)
        if (existingCategorySubscription && !existingCategorySubscription.isFreePlan) {
          const { Listing } = db;
          const listingCount = await Listing.count({
            where: {
              userId,
              userSubscriptionId: existingCategorySubscription.id,
              status: {
                [db.Sequelize.Op.in]: ['pending', 'active', 'sold', 'expired']
              }
            }
          });

          if (listingCount < existingCategorySubscription.listingQuotaLimit) {
            throw new Error(
              `Cannot downgrade to free plan. You have used ${listingCount} of ${existingCategorySubscription.listingQuotaLimit} listings. Please exhaust your current quota first.`
            );
          }
        }
      }

      if (!plan.isActive || !plan.isPublic) {
        throw new Error("Plan is not available for subscription");
      }

      // For free plans, skip payment validation and auto-activate
      if (plan.isFreePlan) {
        // Calculate subscription period for free plan
        const activatedAt = new Date();
        const endsAt = new Date(activatedAt);
        endsAt.setDate(endsAt.getDate() + plan.durationDays);

        // Create subscription with ACTIVE status (auto-approved)
        const subscriptionData = {
          userId,
          planId: plan.id,
          endsAt,
          activatedAt,
          status: "active",
          isTrial: false,
          trialEndsAt: null,
          autoRenew: false,

          // Snapshot plan identification
          planName: plan.name,
          planCode: plan.planCode,
          planVersion: plan.version,
          isFreePlan: plan.isFreePlan,

          // Snapshot pricing (free)
          basePrice: 0,
          discountAmount: 0,
          finalPrice: 0,
          currency: plan.currency,
          billingCycle: plan.billingCycle,
          durationDays: plan.durationDays,

          // Snapshot quotas
          maxTotalListings: plan.maxTotalListings,
          maxActiveListings: plan.maxActiveListings,
          listingQuotaLimit: plan.listingQuotaLimit,
          listingQuotaRollingDays: plan.listingQuotaRollingDays,

          // Snapshot featured & promotional
          maxFeaturedListings: plan.maxFeaturedListings,
          maxBoostedListings: plan.maxBoostedListings,
          maxSpotlightListings: plan.maxSpotlightListings,
          maxHomepageListings: plan.maxHomepageListings,
          featuredDays: plan.featuredDays,
          boostedDays: plan.boostedDays,
          spotlightDays: plan.spotlightDays,

          // Snapshot visibility & priority
          priorityScore: plan.priorityScore,
          searchBoostMultiplier: plan.searchBoostMultiplier,
          recommendationBoostMultiplier: plan.recommendationBoostMultiplier,
          crossCityVisibility: plan.crossCityVisibility,
          nationalVisibility: plan.nationalVisibility,

          // Snapshot listing management
          autoRenewalEnabled: plan.autoRenewal,
          maxRenewals: plan.maxRenewals,
          listingDurationDays: plan.listingDurationDays,
          autoRefreshEnabled: plan.autoRefreshEnabled,
          refreshFrequencyDays: plan.refreshFrequencyDays,
          manualRefreshPerCycle: plan.manualRefreshPerCycle,
          isAutoApproveEnabled: plan.isAutoApproveEnabled,

          // Snapshot support & features
          supportLevel: plan.supportLevel,
          features: plan.features,

          // Payment info (free assignment)
          paymentMethod: "free_plan",
          transactionId: null,
          amountPaid: 0,

          // Metadata
          metadata: { 
            autoActivated: true,
            activatedAt: new Date().toISOString()
          },
          notes: "Free plan - Auto-activated",
        };

        const subscription = await subscriptionRepository.createSubscription(
          subscriptionData,
          userId
        );

        // Expire previous subscription if exists
        if (existingCategorySubscription) {
          await subscriptionRepository.updateSubscription(
            existingCategorySubscription.id,
            {
              status: "expired",
              endsAt: new Date(),
              notes: `${existingCategorySubscription.notes || ""}\nExpired due to upgrade to new plan on ${new Date().toISOString()}`,
            },
            userId
          );
        }

        await transaction.commit();

        return {
          success: true,
          message: "Free plan activated successfully",
          data: subscription,
        };
      }

      // Validate payment gateway data (for paid plans only)
      if (!paymentData.paymentMethod || !paymentData.transactionId) {
        throw new Error("Payment method and transaction ID are required");
      }

      // Verify payment with gateway
      const paymentVerified = await this._verifyPaymentWithGateway(
        paymentData.paymentMethod,
        paymentData.transactionId,
        plan.finalPrice
      );

      if (!paymentVerified.success) {
        throw new Error(
          "Payment verification failed: " + paymentVerified.message
        );
      }

      // Calculate subscription period
      const activatedAt = new Date();
      const endsAt = new Date(activatedAt);
      endsAt.setDate(endsAt.getDate() + plan.durationDays);

      // Create subscription with ACTIVE status (for paid plans after payment verification)
      const subscriptionData = {
        userId,
        planId: plan.id,
        endsAt,
        activatedAt,
        status: "active",
        isTrial: paymentData.isTrial || false,
        trialEndsAt: paymentData.trialEndsAt || null,
        autoRenew: paymentData.autoRenew || false,

        // Snapshot plan identification
        planName: plan.name,
        planCode: plan.planCode,
        planVersion: plan.version,
        isFreePlan: plan.isFreePlan,

        // Snapshot pricing
        basePrice: plan.basePrice,
        discountAmount: plan.discountAmount,
        finalPrice: plan.finalPrice,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        durationDays: plan.durationDays,

        // Snapshot quotas
        maxTotalListings: plan.maxTotalListings,
        maxActiveListings: plan.maxActiveListings,
        listingQuotaLimit: plan.listingQuotaLimit,
        listingQuotaRollingDays: plan.listingQuotaRollingDays,

        // Snapshot featured & promotional
        maxFeaturedListings: plan.maxFeaturedListings,
        maxBoostedListings: plan.maxBoostedListings,
        maxSpotlightListings: plan.maxSpotlightListings,
        maxHomepageListings: plan.maxHomepageListings,
        featuredDays: plan.featuredDays,
        boostedDays: plan.boostedDays,
        spotlightDays: plan.spotlightDays,

        // Snapshot visibility & priority
        priorityScore: plan.priorityScore,
        searchBoostMultiplier: plan.searchBoostMultiplier,
        recommendationBoostMultiplier: plan.recommendationBoostMultiplier,
        crossCityVisibility: plan.crossCityVisibility,
        nationalVisibility: plan.nationalVisibility,

        // Snapshot listing management
        autoRenewalEnabled: plan.autoRenewal,
        maxRenewals: plan.maxRenewals,
        listingDurationDays: plan.listingDurationDays,
        autoRefreshEnabled: plan.autoRefreshEnabled,
        refreshFrequencyDays: plan.refreshFrequencyDays,
        manualRefreshPerCycle: plan.manualRefreshPerCycle,
        isAutoApproveEnabled: plan.isAutoApproveEnabled,

        // Snapshot support & features
        supportLevel: plan.supportLevel,
        features: plan.features,

        // Payment info
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        amountPaid: paymentVerified.amountPaid,

        // Metadata
        metadata: paymentData.metadata || {},
        notes: paymentData.notes || null,
      };

      const subscription = await subscriptionRepository.createSubscription(
        subscriptionData,
        userId
      );

      // Expire previous subscription if exists
      if (existingCategorySubscription) {
        await subscriptionRepository.updateSubscription(
          existingCategorySubscription.id,
          {
            status: 'expired',
            endsAt: new Date(),
            notes: `${existingCategorySubscription.notes || ''}\nExpired due to upgrade to new plan on ${new Date().toISOString()}`
          },
          userId
        );
      }

      // Create invoice with PAID status using invoice repository
      const invoice = await invoiceRepository.create(
        {
          userId,
          subscriptionId: subscription.id,
          invoiceType: "new_subscription",
          invoiceDate: new Date(),
          customerName: paymentData.customerName || "Customer",
          customerMobile: paymentData.customerMobile || "",
          planName: plan.name,
          planCode: plan.planCode,
          planVersion: plan.version,
          isFreePlan: plan.isFreePlan,
          planSnapshot: plan.toJSON(),
          subtotal: plan.finalPrice,
          discountAmount: 0,
          adjustedSubtotal: plan.finalPrice,
          taxAmount: 0,
          taxPercentage: 0,
          totalAmount: plan.finalPrice,
          amountPaid: paymentVerified.amountPaid,
          amountDue: 0,
          currency: plan.currency,
          status: "paid",
          paymentMethod: paymentData.paymentMethod,
          paymentDate: new Date(),
          metadata: {},
        },
        userId
      );

      // Create transaction with COMPLETED status using transaction repository
      await transactionRepository.create(
        {
          invoiceId: invoice.id,
          subscriptionId: subscription.id,
          userId,
          subscriptionPlanId: plan.id,
          transactionType: "payment",
          transactionContext: "new_subscription",
          transactionMethod: "online",
          amount: paymentVerified.amountPaid,
          currency: plan.currency,
          paymentGateway: paymentData.paymentMethod,
          gatewayOrderId: paymentVerified.orderId,
          gatewayPaymentId: paymentData.transactionId,
          gatewaySignature: paymentVerified.signature,
          gatewayResponse: paymentVerified.rawResponse,
          status: "completed",
          initiatedAt: new Date(),
          completedAt: new Date(),
          metadata: {},
        },
        userId
      );

      await transaction.commit();

      return {
        success: true,
        message: SUCCESS_MESSAGES.SUBSCRIPTION_CREATED,
        data: subscription,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Verify payment with gateway (TO BE IMPLEMENTED)
   * @param {string} paymentMethod - Payment method
   * @param {string} transactionId - Transaction ID
   * @param {number} expectedAmount - Expected amount
   * @returns {Promise<Object>} Verification result
   * @private
   */
  async _verifyPaymentWithGateway(
    paymentMethod,
    transactionId,
    expectedAmount
  ) {
    // TODO: Implement actual payment gateway verification
    // Example for Razorpay:
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const payment = await razorpay.payments.fetch(transactionId);
    // if (payment.status === 'captured' && payment.amount === expectedAmount * 100) {
    //   return { success: true, amountPaid: payment.amount / 100, orderId: payment.order_id, signature: payment.signature, rawResponse: payment };
    // }
    // return { success: false, message: 'Payment verification failed' };

    throw new Error("Payment gateway verification not implemented");
  }

  /**
   * Get user's active subscription (legacy - use category-specific methods)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Service response
   */
  async getActiveSubscription(userId) {
    const subscription = await subscriptionRepository.getUserActiveSubscription(
      userId
    );

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    // Check if plan is deprecated and suggest upgrade
    let upgradeAvailable = null;
    if (
      subscription.plan?.deprecatedAt &&
      subscription.plan?.replacedByPlanId
    ) {
      const upgradePlan = await subscriptionRepository.findPlanById(
        subscription.plan.replacedByPlanId
      );
      if (upgradePlan) {
        upgradeAvailable = {
          id: upgradePlan.id,
          name: upgradePlan.name,
          slug: upgradePlan.slug,
          finalPrice: upgradePlan.finalPrice,
          version: upgradePlan.version,
        };
      }
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        subscription,
        upgradeAvailable,
      },
    };
  }

  /**
   * Get user's active subscription for specific category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Service response
   */
  async getActiveSubscriptionByCategory(userId, categoryId) {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const subscription =
      await subscriptionRepository.getUserActiveSubscriptionByCategory(
        userId,
        categoryId
      );

    if (!subscription) {
      // Try to get free plan for category
      const freePlan = await subscriptionRepository.getFreePlanForCategory(
        categoryId
      );
      if (freePlan) {
        return {
          success: true,
          message: "User is on free plan for this category",
          data: {
            subscription: null,
            freePlan,
            needsSubscription: true,
          },
        };
      }
      throw new Error("No subscription found for this category");
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        subscription,
        needsSubscription: false,
      },
    };
  }

  /**
   * Get all user's active subscriptions (all categories)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Service response
   */
  async getAllActiveSubscriptions(userId) {
    const subscriptions =
      await subscriptionRepository.getUserAllActiveSubscriptions(userId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        subscriptions,
        totalActive: subscriptions.length,
      },
    };
  }

  /**
   * Get subscriptions by category (Admin)
   * @param {Object} filters - Filter options including categoryId
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Service response
   */
  async getSubscriptionsByCategory(filters, pagination) {
    // We'll need to add this method to repository
    const result = await subscriptionRepository.getSubscriptionsByCategory(
      filters,
      pagination
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: result.subscriptions,
      pagination: result.pagination,
    };
  }

  /**
   * Get user's subscription history
   * @param {number} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Service response
   */
  async getSubscriptionHistory(userId, options = {}) {
    const result = await subscriptionRepository.getUserSubscriptionHistory(
      userId,
      options
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: result.subscriptions,
      pagination: result.pagination,
    };
  }

  /**
   * Cancel user subscription
   * @param {number} userId - User ID
   * @param {number} subscriptionId - Subscription ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Service response
   */
  async cancelSubscription(userId, subscriptionId, reason = null) {
    const subscription = await subscriptionRepository.findSubscriptionById(
      subscriptionId
    );

    if (!subscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    if (subscription.userId !== userId) {
      throw new Error("Unauthorized to cancel this subscription");
    }

    if (subscription.status !== "active") {
      throw new Error("Only active subscriptions can be cancelled");
    }

    const updatedSubscription = await subscriptionRepository.updateSubscription(
      subscriptionId,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason,
        autoRenew: false,
      },
      userId
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.SUBSCRIPTION_CANCELLED,
      data: updatedSubscription,
    };
  }

  // ==================== ADMIN OPERATIONS (USER SUBSCRIPTIONS) ====================

  /**
   * Get all user subscriptions (Admin)
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Service response
   */
  async getAllSubscriptions(filters = {}, pagination = {}) {
    const result = await subscriptionRepository.getAllSubscriptions(
      filters,
      pagination
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: result.subscriptions,
      pagination: result.pagination,
    };
  }

  /**
   * Get subscription by ID (Admin)
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Service response
   */
  async getSubscriptionById(subscriptionId) {
    const subscription =
      await subscriptionRepository.getSubscriptionWithDetails(subscriptionId);

    if (!subscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: subscription,
    };
  }

  /**
   * Create subscription manually (Admin)
   * @param {Object} subscriptionData - Subscription data
   * @param {number} adminUserId - Admin user ID
   * @returns {Promise<Object>} Service response
   */
  async createSubscriptionManually(subscriptionData, adminUserId) {
    const transaction = await sequelize.transaction();

    try {
      const { userId, planId, endsAt, notes } = subscriptionData;

      // Validate required fields
      if (!userId || !planId) {
        throw new Error("User ID and Plan ID are required");
      }

      // Get plan details first
      const plan = await subscriptionRepository.findPlanById(planId);

      if (!plan) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND);
      }

      const pendingSubscription = await subscriptionRepository.getUserPendingSubscriptionByCategory(
        userId,
        plan.categoryId
      );

      if (pendingSubscription) {
        throw new Error(
          'User has a pending subscription for this category. Please approve/reject it before creating a new subscription.'
        );
      }

      // Check if user already has active subscription for this plan's category
      const existingCategorySubscription =
        await subscriptionRepository.getUserActiveSubscriptionByCategory(
          userId,
          plan.categoryId
        );
      
      if (existingCategorySubscription) {
        // If user has free plan, allow upgrade without quota check
        if (existingCategorySubscription.isFreePlan) {
          // Free plan user can upgrade anytime - no quota check needed
        } else {
          // Paid plan user - check if quota is exhausted
          const { Listing } = db;
          const listingCount = await Listing.count({
            where: {
              userId,
              userSubscriptionId: existingCategorySubscription.id,
              status: {
                [db.Sequelize.Op.in]: ['pending', 'active', 'sold', 'expired']
              }
            }
          });

          // If quota not exhausted, don't allow upgrade
          if (listingCount < existingCategorySubscription.listingQuotaLimit) {
            throw new Error(
              `Cannot upgrade. You have used ${listingCount} of ${existingCategorySubscription.listingQuotaLimit} listings. Please exhaust your current quota before upgrading.`
            );
          }
        }
      }

      // Special validation for free plan subscriptions
      if (plan.isFreePlan) {
        // Check if user already has active free plan for this category
        if (existingCategorySubscription && existingCategorySubscription.isFreePlan) {
          throw new Error('You already have an active free plan for this category');
        }

        // Check if user has exhausted quota (if they have a paid plan)
        if (existingCategorySubscription && !existingCategorySubscription.isFreePlan) {
          const { Listing } = db;
          const listingCount = await Listing.count({
            where: {
              userId,
              userSubscriptionId: existingCategorySubscription.id,
              status: {
                [db.Sequelize.Op.in]: ['pending', 'active', 'sold', 'expired']
              }
            }
          });

          if (listingCount < existingCategorySubscription.listingQuotaLimit) {
            throw new Error(
              `Cannot downgrade to free plan. You have used ${listingCount} of ${existingCategorySubscription.listingQuotaLimit} listings. Please exhaust your current quota first.`
            );
          }
        }
      }

      // Calculate dates if not provided
      const activatedAt = new Date();
      const subscriptionEndsAt = endsAt
        ? new Date(endsAt)
        : new Date(
            activatedAt.getTime() +
              plan.durationDays * 24 * 60 * 60 * 1000
          );

      // Create subscription with plan snapshot
      const newSubscriptionData = {
        userId,
        planId: plan.id,
        endsAt: subscriptionEndsAt,
        activatedAt,
        status: "active",
        isTrial: false,
        autoRenew: false,

        // Snapshot plan identification
        planName: plan.name,
        planCode: plan.planCode,
        planVersion: plan.version,
        isFreePlan: plan.isFreePlan,

        // Snapshot pricing
        basePrice: plan.basePrice,
        discountAmount: plan.discountAmount,
        finalPrice: plan.finalPrice,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        durationDays: plan.durationDays,

        // Snapshot quotas
        maxTotalListings: plan.maxTotalListings,
        maxActiveListings: plan.maxActiveListings,
        listingQuotaLimit: plan.listingQuotaLimit,
        listingQuotaRollingDays: plan.listingQuotaRollingDays,

        // Snapshot featured & promotional
        maxFeaturedListings: plan.maxFeaturedListings,
        maxBoostedListings: plan.maxBoostedListings,
        maxSpotlightListings: plan.maxSpotlightListings,
        maxHomepageListings: plan.maxHomepageListings,
        featuredDays: plan.featuredDays,
        boostedDays: plan.boostedDays,
        spotlightDays: plan.spotlightDays,

        // Snapshot visibility & priority
        priorityScore: plan.priorityScore,
        searchBoostMultiplier: plan.searchBoostMultiplier,
        recommendationBoostMultiplier: plan.recommendationBoostMultiplier,
        crossCityVisibility: plan.crossCityVisibility,
        nationalVisibility: plan.nationalVisibility,

        // Snapshot listing management
        autoRenewalEnabled: plan.autoRenewal,
        maxRenewals: plan.maxRenewals,
        listingDurationDays: plan.listingDurationDays,
        autoRefreshEnabled: plan.autoRefreshEnabled,
        refreshFrequencyDays: plan.refreshFrequencyDays,
        manualRefreshPerCycle: plan.manualRefreshPerCycle,
        isAutoApproveEnabled: plan.isAutoApproveEnabled,

        // Snapshot support & features
        supportLevel: plan.supportLevel,
        features: plan.features,

        // Payment info (manual assignment)
        paymentMethod: "manual",
        amountPaid: 0,

        // Metadata
        metadata: { assignedBy: "admin", adminUserId },
        notes: notes || "Manually assigned by admin",
      };

      const subscription = await subscriptionRepository.createSubscription(
        newSubscriptionData,
        adminUserId
      );

      // Expire previous subscription if exists
      if (existingCategorySubscription) {
        await subscriptionRepository.updateSubscription(
          existingCategorySubscription.id,
          {
            status: 'expired',
            endsAt: new Date(),
            notes: `${existingCategorySubscription.notes || ''}\nExpired due to manual upgrade by admin on ${new Date().toISOString()}`
          },
          adminUserId
        );
      }

      await transaction.commit();

      return {
        success: true,
        message: "Subscription created successfully",
        data: subscription,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update subscription (Admin)
   * @param {number} subscriptionId - Subscription ID
   * @param {Object} updateData - Update data
   * @param {number} adminUserId - Admin user ID
   * @returns {Promise<Object>} Service response
   */
  async updateSubscriptionAdmin(subscriptionId, updateData, adminUserId) {
    try {
      const subscription = await subscriptionRepository.findSubscriptionById(
        subscriptionId
      );

      if (!subscription) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      // Validate status if being updated
      if (updateData.status) {
        const validStatuses = [
          "pending",
          "active",
          "expired",
          "cancelled",
          "suspended",
        ];
        if (!validStatuses.includes(updateData.status)) {
          throw new Error("Invalid subscription status");
        }
      }

      const updatedSubscription =
        await subscriptionRepository.updateSubscription(
          subscriptionId,
          updateData,
          adminUserId
        );

      return {
        success: true,
        message: "Subscription updated successfully",
        data: updatedSubscription,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete subscription (Admin)
   * @param {number} subscriptionId - Subscription ID
   * @param {number} adminUserId - Admin user ID
   * @returns {Promise<Object>} Service response
   */
  async deleteSubscriptionAdmin(subscriptionId, adminUserId) {
    try {
      const subscription = await subscriptionRepository.findSubscriptionById(
        subscriptionId
      );

      if (!subscription) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      await subscriptionRepository.deleteSubscription(
        subscriptionId,
        adminUserId
      );

      return {
        success: true,
        message: "Subscription deleted successfully",
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update subscription status (Admin)
   * @param {number} subscriptionId - Subscription ID
   * @param {string} status - New status
   * @param {number} adminUserId - Admin user ID
   * @returns {Promise<Object>} Service response
   */
  async updateSubscriptionStatus(subscriptionId, status, adminUserId) {
    try {
      const validStatuses = [
        "pending",
        "active",
        "expired",
        "cancelled",
        "suspended",
      ];

      if (!validStatuses.includes(status)) {
        throw new Error("Invalid subscription status");
      }

      const subscription = await subscriptionRepository.findSubscriptionById(
        subscriptionId
      );

      if (!subscription) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      const updateData = { status };

      // If cancelling, add cancellation timestamp
      if (status === "cancelled" && subscription.status !== "cancelled") {
        updateData.cancelledAt = new Date();
        updateData.autoRenew = false;
      }

      const updatedSubscription =
        await subscriptionRepository.updateSubscription(
          subscriptionId,
          updateData,
          adminUserId
        );

      return {
        success: true,
        message: `Subscription status updated to ${status}`,
        data: updatedSubscription,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Extend subscription (Admin)
   * @param {number} subscriptionId - Subscription ID
   * @param {number} extensionDays - Days to extend
   * @param {number} adminUserId - Admin user ID
   * @returns {Promise<Object>} Service response
   */
  async extendSubscription(subscriptionId, extensionDays, adminUserId) {
    try {
      if (!extensionDays || extensionDays < 1) {
        throw new Error("Extension days must be at least 1");
      }

      const subscription = await subscriptionRepository.findSubscriptionById(
        subscriptionId
      );

      if (!subscription) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      // Calculate new end date
      const currentEndsAt = new Date(subscription.endsAt);
      const newEndsAt = new Date(
        currentEndsAt.getTime() + extensionDays * 24 * 60 * 60 * 1000
      );

      const updatedSubscription =
        await subscriptionRepository.updateSubscription(
          subscriptionId,
          {
            endsAt: newEndsAt,
            notes: `${
              subscription.notes || ""
            }\nExtended by ${extensionDays} days on ${new Date().toISOString()}`,
          },
          adminUserId
        );

      return {
        success: true,
        message: `Subscription extended by ${extensionDays} days`,
        data: updatedSubscription,
      };
    } catch (error) {
      throw error;
    }
  }

  // ==================== USER REGISTRATION & FREE PLANS ====================

  /**
   * Auto-assign free plans to new user on registration
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Service response
   */
  async assignFreePlansOnRegistration(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Get all active free plans (for all categories)
      const freePlans = await subscriptionRepository.getAllFreePlans();

      if (freePlans.length === 0) {
        return {
          success: true,
          message: 'No free plans available to assign',
          data: { assignedPlans: [] }
        };
      }

      const assignedPlans = [];

      // Assign free plan for each category
      for (const plan of freePlans) {
        try {
          // Check if user already has subscription for this category
          const existingSubscription = await subscriptionRepository.getUserActiveSubscriptionByCategory(
            userId,
            plan.categoryId
          );

          if (existingSubscription) {
            continue; // Skip if already has subscription for this category
          }

          // Calculate dates for free plan (25 years duration)
          const activatedAt = new Date();
          const endsAt = new Date(activatedAt);
          endsAt.setDate(endsAt.getDate() + 9125); // 25 years

          // Create free subscription
          const subscriptionData = {
            userId,
            planId: plan.id,
            endsAt,
            activatedAt,
            status: 'active',
            isTrial: false,
            autoRenew: false,

            // Snapshot plan identification
            planName: plan.name,
            planCode: plan.planCode,
            planVersion: plan.version,
            isFreePlan: plan.isFreePlan,

            // Snapshot pricing (free)
            basePrice: 0,
            discountAmount: 0,
            finalPrice: 0,
            currency: plan.currency || 'INR',
            billingCycle: 'lifetime',
            durationDays: 9125,

            // Snapshot quotas
            maxTotalListings: plan.maxTotalListings,
            maxActiveListings: plan.maxActiveListings,
            listingQuotaLimit: plan.listingQuotaLimit,
            listingQuotaRollingDays: plan.listingQuotaRollingDays,

            // Snapshot features (minimal for free plans)
            maxFeaturedListings: plan.maxFeaturedListings || 0,
            maxBoostedListings: plan.maxBoostedListings || 0,
            maxSpotlightListings: plan.maxSpotlightListings || 0,
            maxHomepageListings: plan.maxHomepageListings || 0,
            featuredDays: plan.featuredDays || 0,
            boostedDays: plan.boostedDays || 0,
            spotlightDays: plan.spotlightDays || 0,

            // Snapshot visibility & priority
            priorityScore: plan.priorityScore || 0,
            searchBoostMultiplier: plan.searchBoostMultiplier || 1.0,
            recommendationBoostMultiplier: plan.recommendationBoostMultiplier || 1.0,
            crossCityVisibility: plan.crossCityVisibility || false,
            nationalVisibility: plan.nationalVisibility || false,

            // Snapshot listing management
            autoRenewalEnabled: false,
            maxRenewals: 0,
            listingDurationDays: plan.listingDurationDays || 30,
            autoRefreshEnabled: false,
            refreshFrequencyDays: null,
            manualRefreshPerCycle: 0,
            isAutoApproveEnabled: plan.isAutoApproveEnabled || false,

            // Snapshot support & features
            supportLevel: plan.supportLevel || 'basic',
            features: plan.features || {},

            // Payment info (free assignment)
            paymentMethod: 'free_assignment',
            amountPaid: 0,

            // Metadata
            metadata: { 
              assignedOnRegistration: true,
              assignedAt: new Date().toISOString()
            },
            notes: 'Auto-assigned free plan on user registration'
          };

          const subscription = await subscriptionRepository.createSubscription(
            subscriptionData,
            userId
          );

          assignedPlans.push({
            categoryId: plan.categoryId,
            categoryName: plan.category?.name || 'Unknown',
            planId: plan.id,
            planName: plan.name,
            subscriptionId: subscription.id
          });

        } catch (error) {
          console.error(`Error assigning free plan ${plan.id} to user ${userId}:`, error);
          // Continue with other plans if one fails
        }
      }

      return {
        success: true,
        message: `${assignedPlans.length} free plans assigned successfully`,
        data: { assignedPlans }
      };

    } catch (error) {
      console.error('Error in assignFreePlansOnRegistration:', error);
      throw error;
    }
  }

  // ==================== FEATURE EXPIRY TRACKING ====================

  /**
   * Calculate feature expiry date for subscription
   * @param {Object} subscription - Subscription object
   * @param {string} featureType - Feature type (boost, spotlight, homepage, featured)
   * @returns {Promise<Object>} Feature expiry details
   */
  async calculateFeatureExpiry(subscription, featureType) {
    return await quotaService.calculateFeatureExpiry(subscription, featureType);
  }

  /**
   * Get all feature expiry dates for subscription
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} All feature expiry details
   */
  async getAllFeatureExpiries(subscriptionId) {
    const subscription = await subscriptionRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    const features = ['boost', 'spotlight', 'homepage', 'featured'];
    const featureExpiries = {};

    for (const feature of features) {
      try {
        const expiry = await this.calculateFeatureExpiry(subscription, feature);
        featureExpiries[feature] = expiry.data;
      } catch (error) {
        featureExpiries[feature] = null;
      }
    }

    return {
      success: true,
      message: 'Feature expiries calculated successfully',
      data: {
        subscriptionId,
        featureExpiries,
        subscriptionStatus: subscription.status,
        activatedAt: subscription.activatedAt
      }
    };
  }

  /**
   * Check if subscription has active features
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Active features status
   */
  async getActiveFeatures(subscriptionId) {
    const allExpiries = await this.getAllFeatureExpiries(subscriptionId);

    if (!allExpiries.success) {
      return allExpiries;
    }

    const activeFeatures = {};
    const expiredFeatures = {};

    Object.entries(allExpiries.data.featureExpiries).forEach(([feature, expiry]) => {
      if (expiry && expiry.isActive) {
        activeFeatures[feature] = expiry;
      } else if (expiry && expiry.isExpired) {
        expiredFeatures[feature] = expiry;
      }
    });

    return {
      success: true,
      message: 'Active features retrieved successfully',
      data: {
        subscriptionId,
        activeFeatures,
        expiredFeatures,
        totalActiveFeatures: Object.keys(activeFeatures).length,
        totalExpiredFeatures: Object.keys(expiredFeatures).length
      }
    };
  }

  // ==================== QUOTA INTEGRATION ====================

  /**
   * Get subscription with quota status
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Subscription with quota details
   */
  async getSubscriptionWithQuota(userId, categoryId) {
    const subscription = await this.getActiveSubscriptionByCategory(userId, categoryId);
    
    if (!subscription.success) {
      return subscription;
    }

    // Get quota status
    const quotaStatus = await quotaService.getQuotaStatus(userId, categoryId);

    return {
      success: true,
      message: 'Subscription with quota status retrieved successfully',
      data: {
        subscription: subscription.data.subscription,
        quotaStatus: quotaStatus.data,
        needsSubscription: subscription.data.needsSubscription
      }
    };
  }

  /**
   * Get all subscriptions with quota status for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} All subscriptions with quota
   */
  async getAllSubscriptionsWithQuota(userId) {
    const subscriptions = await this.getAllActiveSubscriptions(userId);
    
    if (!subscriptions.success) {
      return subscriptions;
    }

    const subscriptionsWithQuota = [];

    for (const subscription of subscriptions.data.subscriptions) {
      if (subscription.plan?.categoryId) {
        try {
          const quotaStatus = await quotaService.getQuotaStatus(userId, subscription.plan.categoryId);
          
          subscriptionsWithQuota.push({
            subscription,
            quotaStatus: quotaStatus.data,
            categoryId: subscription.plan.categoryId,
            categoryName: subscription.plan.category?.name || 'Unknown'
          });
        } catch (error) {
          console.error(`Error getting quota for subscription ${subscription.id}:`, error);
        }
      }
    }

    return {
      success: true,
      message: 'All subscriptions with quota retrieved successfully',
      data: {
        subscriptionsWithQuota,
        totalSubscriptions: subscriptionsWithQuota.length
      }
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if update contains critical field changes
   * @param {Object} existingPlan - Existing plan
   * @param {Object} updateData - Update data
   * @returns {boolean} True if critical fields changed
   */
  _hasCriticalFieldChanges(existingPlan, updateData) {
    for (const field of this.CRITICAL_FIELDS) {
      if (
        updateData[field] !== undefined &&
        updateData[field] !== existingPlan[field]
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Create new version of plan
   * @param {Object} existingPlan - Existing plan
   * @param {Object} updateData - Update data
   * @param {number} userId - Creator user ID
   * @param {string} userName - Creator user name
   * @returns {Promise<Object>} Service response
   */
  async _createNewVersion(existingPlan, updateData, userId, userName) {
    const transaction = await sequelize.transaction();

    try {
      const newVersion = existingPlan.version + 1;

      // Auto-generate slug for new version: planCode-v2, planCode-v3, etc.
      const newSlug = `${existingPlan.planCode}-v${newVersion}`;

      // Check if new slug already exists (shouldn't happen with version suffix)
      const slugExists = await subscriptionRepository.slugExists(newSlug);
      if (slugExists) {
        throw new Error(
          `Slug ${newSlug} already exists. This is unexpected - please contact support.`
        );
      }

      // Create new version
      const newPlanData = {
        ...existingPlan.toJSON(),
        ...updateData,
        id: undefined, // Remove ID to create new record
        planCode: existingPlan.planCode, // Keep same plan code
        version: newVersion,
        slug: newSlug, // Always use auto-generated slug for versions
        isActive: true,
        isPublic:
          updateData.isPublic !== undefined ? updateData.isPublic : true,
        deprecatedAt: null,
        replacedByPlanId: null,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
      };

      const newPlan = await subscriptionRepository.createPlan(
        newPlanData,
        userId,
        userName
      );

      // Deprecate old version
      await subscriptionRepository.updatePlan(
        existingPlan.id,
        {
          isPublic: false,
          deprecatedAt: new Date(),
          replacedByPlanId: newPlan.id,
        },
        userId,
        userName
      );

      await transaction.commit();

      return {
        success: true,
        message: `New plan version ${newVersion} created successfully`,
        data: newPlan,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

// Export singleton instance
export default new SubscriptionService();
