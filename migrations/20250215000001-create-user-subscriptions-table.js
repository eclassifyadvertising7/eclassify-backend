export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_subscriptions', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    plan_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    // Subscription Period
    starts_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    ends_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    activated_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    // Status & Lifecycle
    status: {
      type: Sequelize.ENUM('pending', 'active', 'expired', 'cancelled', 'suspended'),
      allowNull: false,
      defaultValue: 'pending'
    },
    is_trial: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    trial_ends_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    // Auto-Renewal
    auto_renew: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    cancelled_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    cancellation_reason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    // Reminders
    renewal_reminder_sent: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    expiry_reminder_sent: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Plan Identification Snapshot
    plan_name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    plan_code: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    plan_version: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    // Pricing Snapshot
    base_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    discount_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    final_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: 'INR'
    },
    billing_cycle: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    duration_days: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    // Listing Quotas Snapshot
    max_total_listings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    max_active_listings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    listing_quota_limit: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    listing_quota_rolling_days: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    // Featured & Promotional Snapshot
    max_featured_listings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    max_boosted_listings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    max_spotlight_listings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    max_homepage_listings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    featured_days: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    boosted_days: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    spotlight_days: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Visibility & Priority Snapshot
    priority_score: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    search_boost_multiplier: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0
    },
    recommendation_boost_multiplier: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0
    },
    cross_city_visibility: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    national_visibility: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Listing Management Snapshot
    auto_renewal_enabled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    max_renewals: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    listing_duration_days: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    auto_refresh_enabled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    refresh_frequency_days: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    manual_refresh_per_cycle: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_auto_approve_enabled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Snapshot: auto-approve setting from plan'
    },
    // Support Snapshot
    support_level: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'standard'
    },
    // Features Snapshot
    features: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    },
    // Payment Reference
    invoice_id: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    payment_method: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    transaction_id: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    amount_paid: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    // Upgrade/Downgrade Tracking
    previous_subscription_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'user_subscriptions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    is_upgrade: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_downgrade: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    proration_credit: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    // Metadata & Notes
    metadata: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    // Audit Fields
    created_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    updated_by: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    deleted_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Create indexes
  await queryInterface.addIndex('user_subscriptions', ['user_id'], {
    name: 'idx_user_subscriptions_user_id'
  });

  await queryInterface.addIndex('user_subscriptions', ['plan_id'], {
    name: 'idx_user_subscriptions_plan_id'
  });

  await queryInterface.addIndex('user_subscriptions', ['status'], {
    name: 'idx_user_subscriptions_status'
  });

  await queryInterface.addIndex('user_subscriptions', ['ends_at'], {
    name: 'idx_user_subscriptions_ends_at'
  });

  await queryInterface.addIndex('user_subscriptions', ['deleted_at'], {
    name: 'idx_user_subscriptions_deleted_at'
  });

  // Composite index for common query (get user's active subscription)
  await queryInterface.addIndex('user_subscriptions', ['user_id', 'status'], {
    name: 'idx_user_subscriptions_user_status'
  });

  // Unique constraint: Only one active subscription per user
  await queryInterface.addIndex('user_subscriptions', ['user_id', 'status'], {
    name: 'unique_user_active_subscription',
    unique: true,
    where: {
      status: 'active',
      deleted_at: null
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('user_subscriptions');
}
