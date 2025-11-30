import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserSubscription = sequelize.define('UserSubscription', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plan_id'
    },
    // Subscription Period
    startsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'starts_at'
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'ends_at'
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'activated_at'
    },
    // Status & Lifecycle
    status: {
      type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled', 'suspended'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status'
    },
    isTrial: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_trial'
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'trial_ends_at'
    },
    // Auto-Renewal
    autoRenew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_renew'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at'
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cancellation_reason'
    },
    // Reminders
    renewalReminderSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'renewal_reminder_sent'
    },
    expiryReminderSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'expiry_reminder_sent'
    },
    // Plan Identification Snapshot
    planName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'plan_name'
    },
    planCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'plan_code'
    },
    planVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plan_version'
    },
    // Pricing Snapshot
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'base_price'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
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
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'billing_cycle'
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_days'
    },
    // Listing Quotas Snapshot
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
      field: 'listing_quota_limit'
    },
    listingQuotaRollingDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'listing_quota_rolling_days'
    },
    // Featured & Promotional Snapshot
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
    // Visibility & Priority Snapshot
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
    // Listing Management Snapshot
    autoRenewalEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_renewal_enabled'
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
    // Support Snapshot
    supportLevel: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'standard',
      field: 'support_level'
    },
    // Features Snapshot
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      field: 'features'
    },
    // Payment Reference
    invoiceId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'invoice_id'
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'payment_method'
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'transaction_id'
    },
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'amount_paid'
    },
    // Upgrade/Downgrade Tracking
    previousSubscriptionId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'previous_subscription_id'
    },
    isUpgrade: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_upgrade'
    },
    isDowngrade: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_downgrade'
    },
    prorationCredit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'proration_credit'
    },
    // Metadata & Notes
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      field: 'metadata'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes'
    },
    // Audit Fields
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'updated_by'
    },
    deletedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'deleted_by'
    }
  }, {
    tableName: 'user_subscriptions',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  UserSubscription.associate = (models) => {
    UserSubscription.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    UserSubscription.belongsTo(models.SubscriptionPlan, {
      foreignKey: 'planId',
      as: 'plan'
    });

    // Self-reference for subscription chain
    UserSubscription.belongsTo(models.UserSubscription, {
      foreignKey: 'previousSubscriptionId',
      as: 'previousSubscription'
    });

    // Audit associations
    UserSubscription.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    UserSubscription.belongsTo(models.User, {
      foreignKey: 'deletedBy',
      as: 'deleter'
    });
  };

  return UserSubscription;
};
