/**
 * Feature Repository
 * Database operations for feature management and tracking
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { Listing, UserSubscription, SubscriptionPlan } = models;

class FeatureRepository {
  /**
   * Get listings with active features
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Listings with active features
   */
  async getListingsWithActiveFeatures(filters = {}) {
    const whereClause = {
      status: 'active'
    };

    // Add category filter if provided
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    // Add user filter if provided
    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    // Build feature conditions
    const featureConditions = [];

    // Featured listings
    featureConditions.push({
      isFeatured: true,
      featuredUntil: {
        [Op.gt]: new Date()
      }
    });

    // Metadata-based features (boost, spotlight, homepage)
    const metadataConditions = [];
    
    if (filters.includeBoost !== false) {
      metadataConditions.push({
        [Op.and]: [
          { 'metadata.isBoost': true },
          { 'metadata.boostedUntil': { [Op.gt]: new Date() } }
        ]
      });
    }

    if (filters.includeSpotlight !== false) {
      metadataConditions.push({
        [Op.and]: [
          { 'metadata.isSpotlight': true },
          { 'metadata.spotlightUntil': { [Op.gt]: new Date() } }
        ]
      });
    }

    if (filters.includeHomepage !== false) {
      metadataConditions.push({
        [Op.and]: [
          { 'metadata.isHomepage': true },
          { 'metadata.homepageUntil': { [Op.gt]: new Date() } }
        ]
      });
    }

    // Combine all feature conditions
    if (metadataConditions.length > 0) {
      featureConditions.push(...metadataConditions);
    }

    // Apply feature filters
    if (featureConditions.length > 0) {
      whereClause[Op.or] = featureConditions;
    }

    const listings = await Listing.findAll({
      where: whereClause,
      include: [
        {
          model: UserSubscription,
          as: 'userSubscription',
          include: [
            {
              model: SubscriptionPlan,
              as: 'plan',
              attributes: ['id', 'name', 'planCode']
            }
          ]
        }
      ],
      order: [
        ['isFeatured', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: filters.limit || 50
    });

    return listings;
  }

  /**
   * Get listings with expired features
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Listings with expired features
   */
  async getListingsWithExpiredFeatures(filters = {}) {
    const whereClause = {
      status: 'active'
    };

    // Add category filter if provided
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    const now = new Date();
    const expiredConditions = [];

    // Expired featured listings
    expiredConditions.push({
      isFeatured: true,
      featuredUntil: {
        [Op.lt]: now
      }
    });

    // Expired metadata-based features
    expiredConditions.push({
      [Op.or]: [
        {
          [Op.and]: [
            { 'metadata.isBoost': true },
            { 'metadata.boostedUntil': { [Op.lt]: now } }
          ]
        },
        {
          [Op.and]: [
            { 'metadata.isSpotlight': true },
            { 'metadata.spotlightUntil': { [Op.lt]: now } }
          ]
        },
        {
          [Op.and]: [
            { 'metadata.isHomepage': true },
            { 'metadata.homepageUntil': { [Op.lt]: now } }
          ]
        }
      ]
    });

    whereClause[Op.or] = expiredConditions;

    const listings = await Listing.findAll({
      where: whereClause,
      attributes: ['id', 'title', 'isFeatured', 'featuredUntil', 'metadata', 'userId'],
      limit: filters.limit || 100
    });

    return listings;
  }

  /**
   * Get feature usage statistics for user
   * @param {number} userId - User ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Feature usage statistics
   */
  async getUserFeatureUsageStats(userId, options = {}) {
    const { categoryId, subscriptionId } = options;

    const whereClause = {
      userId,
      status: {
        [Op.in]: ['active', 'sold', 'expired']
      }
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (subscriptionId) {
      whereClause.userSubscriptionId = subscriptionId;
    }

    const listings = await Listing.findAll({
      where: whereClause,
      attributes: ['id', 'isFeatured', 'featuredUntil', 'metadata', 'status', 'createdAt']
    });

    const stats = {
      totalListings: listings.length,
      featuredCount: 0,
      boostedCount: 0,
      spotlightCount: 0,
      homepageCount: 0,
      activeFeaturedCount: 0,
      activeBoostedCount: 0,
      activeSpotlightCount: 0,
      activeHomepageCount: 0
    };

    const now = new Date();

    listings.forEach(listing => {
      // Count all feature usage (historical)
      if (listing.isFeatured) stats.featuredCount++;
      if (listing.metadata?.isBoost) stats.boostedCount++;
      if (listing.metadata?.isSpotlight) stats.spotlightCount++;
      if (listing.metadata?.isHomepage) stats.homepageCount++;

      // Count currently active features
      if (listing.isFeatured && listing.featuredUntil && new Date(listing.featuredUntil) > now) {
        stats.activeFeaturedCount++;
      }
      if (listing.metadata?.isBoost && listing.metadata?.boostedUntil && new Date(listing.metadata.boostedUntil) > now) {
        stats.activeBoostedCount++;
      }
      if (listing.metadata?.isSpotlight && listing.metadata?.spotlightUntil && new Date(listing.metadata.spotlightUntil) > now) {
        stats.activeSpotlightCount++;
      }
      if (listing.metadata?.isHomepage && listing.metadata?.homepageUntil && new Date(listing.metadata.homepageUntil) > now) {
        stats.activeHomepageCount++;
      }
    });

    return stats;
  }

  /**
   * Update listing feature status
   * @param {number} listingId - Listing ID
   * @param {string} featureType - Feature type
   * @param {boolean} isActive - Active status
   * @param {Date} expiresAt - Expiry date
   * @returns {Promise<Object>} Updated listing
   */
  async updateListingFeatureStatus(listingId, featureType, isActive, expiresAt = null) {
    const listing = await Listing.findByPk(listingId);

    if (!listing) {
      throw new Error('Listing not found');
    }

    const updateData = {};

    switch (featureType) {
      case 'featured':
        updateData.isFeatured = isActive;
        updateData.featuredUntil = isActive ? expiresAt : null;
        break;

      case 'boost':
        const boostMetadata = { ...listing.metadata };
        if (isActive) {
          boostMetadata.isBoost = true;
          boostMetadata.boostedUntil = expiresAt;
        } else {
          delete boostMetadata.isBoost;
          delete boostMetadata.boostedUntil;
        }
        updateData.metadata = boostMetadata;
        break;

      case 'spotlight':
        const spotlightMetadata = { ...listing.metadata };
        if (isActive) {
          spotlightMetadata.isSpotlight = true;
          spotlightMetadata.spotlightUntil = expiresAt;
        } else {
          delete spotlightMetadata.isSpotlight;
          delete spotlightMetadata.spotlightUntil;
        }
        updateData.metadata = spotlightMetadata;
        break;

      case 'homepage':
        const homepageMetadata = { ...listing.metadata };
        if (isActive) {
          homepageMetadata.isHomepage = true;
          homepageMetadata.homepageUntil = expiresAt;
        } else {
          delete homepageMetadata.isHomepage;
          delete homepageMetadata.homepageUntil;
        }
        updateData.metadata = homepageMetadata;
        break;

      default:
        throw new Error(`Invalid feature type: ${featureType}`);
    }

    await listing.update(updateData);
    return await Listing.findByPk(listingId);
  }

  /**
   * Get subscription feature limits
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Feature limits and usage
   */
  async getSubscriptionFeatureLimits(subscriptionId) {
    const subscription = await UserSubscription.findByPk(subscriptionId, {
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get current usage
    const currentUsage = await this.getUserFeatureUsageStats(subscription.userId, {
      subscriptionId
    });

    return {
      subscription: {
        id: subscription.id,
        planName: subscription.planName,
        status: subscription.status
      },
      limits: {
        maxFeaturedListings: subscription.maxFeaturedListings,
        maxBoostedListings: subscription.maxBoostedListings,
        maxSpotlightListings: subscription.maxSpotlightListings,
        maxHomepageListings: subscription.maxHomepageListings,
        featuredDays: subscription.featuredDays,
        boostedDays: subscription.boostedDays,
        spotlightDays: subscription.spotlightDays
      },
      currentUsage: {
        activeFeaturedCount: currentUsage.activeFeaturedCount,
        activeBoostedCount: currentUsage.activeBoostedCount,
        activeSpotlightCount: currentUsage.activeSpotlightCount,
        activeHomepageCount: currentUsage.activeHomepageCount
      },
      availability: {
        canUseFeatured: currentUsage.activeFeaturedCount < subscription.maxFeaturedListings,
        canUseBoost: currentUsage.activeBoostedCount < subscription.maxBoostedListings,
        canUseSpotlight: currentUsage.activeSpotlightCount < subscription.maxSpotlightListings,
        canUseHomepage: currentUsage.activeHomepageCount < subscription.maxHomepageListings
      }
    };
  }
}

// Export singleton instance
export default new FeatureRepository();