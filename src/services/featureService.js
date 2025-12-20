/**
 * Feature Service
 * Business logic for subscription feature management and expiry tracking
 */

import subscriptionRepository from '#repositories/subscriptionRepository.js';
import listingRepository from '#repositories/listingRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class FeatureService {
  /**
   * Available feature types
   */
  FEATURE_TYPES = ['boost', 'spotlight', 'homepage', 'featured'];

  /**
   * Calculate feature expiry date
   * @param {Object} subscription - Subscription object
   * @param {string} featureType - Feature type (boost, spotlight, homepage, featured)
   * @returns {Promise<Object>} Feature expiry calculation
   */
  async calculateFeatureExpiry(subscription, featureType) {
    if (!subscription || !featureType) {
      throw new Error('Subscription and feature type are required');
    }

    if (!this.FEATURE_TYPES.includes(featureType)) {
      throw new Error(`Invalid feature type. Must be one of: ${this.FEATURE_TYPES.join(', ')}`);
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
   * Get all feature expiry dates for subscription
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} All feature expiry details
   */
  async getAllFeatureExpiries(subscriptionId) {
    const subscription = await subscriptionRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    const featureExpiries = {};

    for (const feature of this.FEATURE_TYPES) {
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
   * Get active features for subscription
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

  /**
   * Check if user has active feature for category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @param {string} featureType - Feature type
   * @returns {Promise<Object>} Feature availability
   */
  async checkUserFeatureAvailability(userId, categoryId, featureType) {
    if (!userId || !categoryId || !featureType) {
      throw new Error('User ID, Category ID, and Feature Type are required');
    }

    if (!this.FEATURE_TYPES.includes(featureType)) {
      throw new Error(`Invalid feature type. Must be one of: ${this.FEATURE_TYPES.join(', ')}`);
    }

    // Get user's active subscription for category
    const subscription = await subscriptionRepository.getUserActiveSubscriptionByCategory(userId, categoryId);

    if (!subscription) {
      return {
        success: false,
        message: 'No active subscription found for this category',
        data: {
          hasFeature: false,
          reason: 'no_subscription'
        }
      };
    }

    // Calculate feature expiry
    const featureExpiry = await this.calculateFeatureExpiry(subscription, featureType);

    if (!featureExpiry.success) {
      return {
        success: false,
        message: featureExpiry.message,
        data: {
          hasFeature: false,
          reason: 'feature_not_available'
        }
      };
    }

    return {
      success: true,
      message: featureExpiry.data.isActive ? 'Feature is active' : 'Feature has expired',
      data: {
        hasFeature: featureExpiry.data.isActive,
        featureExpiry: featureExpiry.data,
        subscription: {
          id: subscription.id,
          planName: subscription.planName
        }
      }
    };
  }

  /**
   * Apply feature to listing
   * @param {number} listingId - Listing ID
   * @param {string} featureType - Feature type
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Feature application result
   */
  async applyFeatureToListing(listingId, featureType, userId) {
    if (!listingId || !featureType || !userId) {
      throw new Error('Listing ID, Feature Type, and User ID are required');
    }

    if (!this.FEATURE_TYPES.includes(featureType)) {
      throw new Error(`Invalid feature type. Must be one of: ${this.FEATURE_TYPES.join(', ')}`);
    }

    // Get listing details
    const listing = await listingRepository.getById(listingId);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Check ownership
    if (listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      throw new Error('Only active listings can have features applied');
    }

    // Check feature availability
    const featureCheck = await this.checkUserFeatureAvailability(userId, listing.categoryId, featureType);

    if (!featureCheck.data.hasFeature) {
      return {
        success: false,
        message: `Cannot apply ${featureType}: ${featureCheck.message}`,
        data: featureCheck.data
      };
    }

    // Apply feature based on type
    const updateData = {};
    const featureExpiry = featureCheck.data.featureExpiry;

    switch (featureType) {
      case 'featured':
        updateData.isFeatured = true;
        updateData.featuredUntil = featureExpiry.expiresAt;
        break;
      case 'boost':
        // Boost typically affects search ranking - could be stored in metadata
        updateData.metadata = {
          ...listing.metadata,
          boostedUntil: featureExpiry.expiresAt,
          isBoost: true
        };
        break;
      case 'spotlight':
        updateData.metadata = {
          ...listing.metadata,
          spotlightUntil: featureExpiry.expiresAt,
          isSpotlight: true
        };
        break;
      case 'homepage':
        updateData.metadata = {
          ...listing.metadata,
          homepageUntil: featureExpiry.expiresAt,
          isHomepage: true
        };
        break;
    }

    // Update listing
    await listingRepository.update(listingId, updateData, { userId });

    // Get updated listing
    const updatedListing = await listingRepository.getById(listingId, { includeAll: true });

    return {
      success: true,
      message: `${featureType} feature applied successfully`,
      data: {
        listing: updatedListing,
        featureType,
        expiresAt: featureExpiry.expiresAt,
        daysRemaining: featureExpiry.daysRemaining
      }
    };
  }

  /**
   * Remove expired features from listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Cleanup result
   */
  async removeExpiredFeatures(listingId) {
    const listing = await listingRepository.getById(listingId);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    const now = new Date();
    const updateData = {};
    let hasUpdates = false;

    // Check featured expiry
    if (listing.isFeatured && listing.featuredUntil && new Date(listing.featuredUntil) < now) {
      updateData.isFeatured = false;
      updateData.featuredUntil = null;
      hasUpdates = true;
    }

    // Check metadata-based features
    if (listing.metadata) {
      const metadata = { ...listing.metadata };
      let metadataUpdated = false;

      // Check boost expiry
      if (metadata.boostedUntil && new Date(metadata.boostedUntil) < now) {
        delete metadata.boostedUntil;
        delete metadata.isBoost;
        metadataUpdated = true;
      }

      // Check spotlight expiry
      if (metadata.spotlightUntil && new Date(metadata.spotlightUntil) < now) {
        delete metadata.spotlightUntil;
        delete metadata.isSpotlight;
        metadataUpdated = true;
      }

      // Check homepage expiry
      if (metadata.homepageUntil && new Date(metadata.homepageUntil) < now) {
        delete metadata.homepageUntil;
        delete metadata.isHomepage;
        metadataUpdated = true;
      }

      if (metadataUpdated) {
        updateData.metadata = metadata;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      await listingRepository.update(listingId, updateData);
    }

    return {
      success: true,
      message: hasUpdates ? 'Expired features removed' : 'No expired features found',
      data: {
        listingId,
        updatesApplied: hasUpdates,
        removedFeatures: Object.keys(updateData)
      }
    };
  }

  /**
   * Get feature usage statistics for subscription
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Feature usage stats
   */
  async getFeatureUsageStats(subscriptionId) {
    const subscription = await subscriptionRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    // Get all listings for this subscription
    const listings = await listingRepository.getAll({
      userSubscriptionId: subscriptionId
    });

    const stats = {
      totalListings: listings.listings?.length || 0,
      featuredListings: 0,
      boostedListings: 0,
      spotlightListings: 0,
      homepageListings: 0
    };

    // Count feature usage
    if (listings.listings) {
      listings.listings.forEach(listing => {
        if (listing.isFeatured) stats.featuredListings++;
        if (listing.metadata?.isBoost) stats.boostedListings++;
        if (listing.metadata?.isSpotlight) stats.spotlightListings++;
        if (listing.metadata?.isHomepage) stats.homepageListings++;
      });
    }

    return {
      success: true,
      message: 'Feature usage statistics retrieved successfully',
      data: {
        subscriptionId,
        stats,
        subscription: {
          planName: subscription.planName,
          status: subscription.status
        }
      }
    };
  }

  /**
   * Bulk cleanup expired features (for cron job)
   * @param {Object} options - Cleanup options
   * @returns {Promise<Object>} Cleanup results
   */
  async bulkCleanupExpiredFeatures(options = {}) {
    const { limit = 100, categoryId = null } = options;

    // Get listings with potentially expired features
    const filters = {
      status: 'active'
    };

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    const listings = await listingRepository.getAll(filters, { limit });

    const results = {
      processed: 0,
      updated: 0,
      errors: 0
    };

    if (listings.listings) {
      for (const listing of listings.listings) {
        try {
          results.processed++;
          const cleanup = await this.removeExpiredFeatures(listing.id);
          if (cleanup.data.updatesApplied) {
            results.updated++;
          }
        } catch (error) {
          results.errors++;
          console.error(`Error cleaning up features for listing ${listing.id}:`, error);
        }
      }
    }

    return {
      success: true,
      message: `Bulk cleanup completed: ${results.updated} listings updated`,
      data: results
    };
  }
}

// Export singleton instance
export default new FeatureService();