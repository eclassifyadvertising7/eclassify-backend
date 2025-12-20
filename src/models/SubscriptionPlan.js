import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    planCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'plan_code'
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'version'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'slug'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'short_description'
    },
    // Pricing
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'base_price'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'discount_amount'
    },
    finalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'final_price'
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'INR',
      field: 'currency'
    },
    billingCycle: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'one_time'),
      allowNull: true,
      field: 'billing_cycle'
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_days'
    },
    // Display & Marketing
    tagline: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'tagline'
    },
    showOriginalPrice: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'show_original_price'
    },
    showOfferBadge: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'show_offer_badge'
    },
    offerBadgeText: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'offer_badge_text'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order'
    },
    // Category & Location Restrictions
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id'
    },
    categoryName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'category_name'
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'state_id'
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'city_id'
    },
    // Listing Quotas
    maxTotalListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'max_total_listings'
    },
    maxActiveListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'max_active_listings'
    },
    listingQuotaLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'listing_quota_limit',
      comment: 'Max listings allowed in rolling window'
    },
    listingQuotaRollingDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'listing_quota_rolling_days',
      comment: 'Rolling window period in days'
    },
    // Featured & Promotional
    maxFeaturedListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'max_featured_listings'
    },
    maxBoostedListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'max_boosted_listings'
    },
    maxSpotlightListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'max_spotlight_listings'
    },
    maxHomepageListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'max_homepage_listings'
    },
    featuredDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'featured_days'
    },
    boostedDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'boosted_days'
    },
    spotlightDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'spotlight_days'
    },
    // Visibility & Priority
    priorityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'priority_score'
    },
    searchBoostMultiplier: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0,
      field: 'search_boost_multiplier'
    },
    recommendationBoostMultiplier: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0,
      field: 'recommendation_boost_multiplier'
    },
    crossCityVisibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'cross_city_visibility'
    },
    nationalVisibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'national_visibility'
    },
    // Listing Management
    autoRenewal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_renewal'
    },
    maxRenewals: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'max_renewals'
    },
    listingDurationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: 'listing_duration_days'
    },
    autoRefreshEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_refresh_enabled'
    },
    refreshFrequencyDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'refresh_frequency_days'
    },
    manualRefreshPerCycle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'manual_refresh_per_cycle'
    },
    isAutoApproveEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_auto_approve_enabled'
    },
    // Support
    supportLevel: {
      type: DataTypes.ENUM('none', 'standard', 'priority', 'dedicated'),
      allowNull: false,
      defaultValue: 'standard',
      field: 'support_level'
    },
    // Features JSONB
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      field: 'features'
    },
    // Add-ons & Metadata
    availableAddons: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'available_addons'
    },
    upsellSuggestions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      field: 'upsell_suggestions'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      field: 'metadata'
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'internal_notes'
    },
    termsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'terms_and_conditions'
    },
    // Plan Type Flags
    isFreePlan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_free_plan'
    },
    isQuotaBased: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_quota_based'
    },
    // Status & Visibility
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_public'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_default'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_featured'
    },
    isSystemPlan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_system_plan'
    },
    // Versioning
    deprecatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deprecated_at'
    },
    replacedByPlanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'replaced_by_plan_id'
    },
    // Audit Fields
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'updated_by'
    },
    deletedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'deleted_by'
    }
  }, {
    sequelize,
    tableName: 'subscription_plans',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeUpdate: async (plan, options) => {
        if (options.userId && options.userName) {
          const currentUpdates = plan.updatedBy || [];
          plan.updatedBy = [
            ...currentUpdates,
            {
              userId: options.userId,
              userName: options.userName,
              timestamp: new Date().toISOString()
            }
          ];
        }
      },
      beforeDestroy: async (plan) => {
        if (plan.isSystemPlan) {
          throw new Error('Cannot delete system plan. This plan is required by the application.');
        }
      }
    }
  });

  SubscriptionPlan.associate = (models) => {
    // Self-referencing for plan replacement
    SubscriptionPlan.belongsTo(models.SubscriptionPlan, {
      foreignKey: 'replacedByPlanId',
      as: 'replacementPlan'
    });

    // Category & Location associations
    SubscriptionPlan.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });

    SubscriptionPlan.belongsTo(models.State, {
      foreignKey: 'stateId',
      as: 'state'
    });

    SubscriptionPlan.belongsTo(models.City, {
      foreignKey: 'cityId',
      as: 'city'
    });

    // Audit associations
    SubscriptionPlan.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    SubscriptionPlan.belongsTo(models.User, {
      foreignKey: 'deletedBy',
      as: 'deleter'
    });
  };

  return SubscriptionPlan;
};
