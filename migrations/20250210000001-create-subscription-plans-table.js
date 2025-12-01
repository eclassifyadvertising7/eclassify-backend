export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('subscription_plans', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    plan_code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    version: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    slug: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    short_description: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    // Pricing
    base_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    discount_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
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
      type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'one_time'),
      allowNull: true
    },
    duration_days: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    // Display & Marketing
    tagline: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    show_original_price: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    show_offer_badge: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    offer_badge_text: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    sort_order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Listing Quotas
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
      allowNull: true,
      comment: 'Max listings allowed in rolling window'
    },
    listing_quota_rolling_days: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Rolling window period in days'
    },
    // Featured & Promotional
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
    // Visibility & Priority
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
    // Listing Management
    auto_renewal: {
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
      comment: 'If true, listings under this plan are auto-approved'
    },
    // Support
    support_level: {
      type: Sequelize.ENUM('none', 'standard', 'priority', 'dedicated'),
      allowNull: false,
      defaultValue: 'standard'
    },
    // Features JSONB
    features: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    },
    // Add-ons & Metadata
    available_addons: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    },
    upsell_suggestions: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    },
    internal_notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    terms_and_conditions: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    // Status & Visibility
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_public: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_default: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_featured: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_system_plan: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Versioning
    deprecated_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    replaced_by_plan_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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
      type: Sequelize.JSON,
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
  await queryInterface.addIndex('subscription_plans', ['plan_code'], {
    name: 'idx_subscription_plans_plan_code',
    unique: true
  });

  await queryInterface.addIndex('subscription_plans', ['slug'], {
    name: 'idx_subscription_plans_slug',
    unique: true
  });

  await queryInterface.addIndex('subscription_plans', ['is_active'], {
    name: 'idx_subscription_plans_is_active'
  });

  await queryInterface.addIndex('subscription_plans', ['is_public'], {
    name: 'idx_subscription_plans_is_public'
  });

  await queryInterface.addIndex('subscription_plans', ['is_default'], {
    name: 'idx_subscription_plans_is_default'
  });

  await queryInterface.addIndex('subscription_plans', ['deleted_at'], {
    name: 'idx_subscription_plans_deleted_at'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('subscription_plans');
}
