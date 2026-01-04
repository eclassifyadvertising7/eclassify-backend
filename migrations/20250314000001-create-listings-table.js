/**
 * Migration: Create listings table
 * High-volume table storing common fields for all listing types
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('listings', {
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
      onDelete: 'CASCADE'
    },
    category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    category_slug: {
      type: Sequelize.STRING(100),
      allowNull: true,
      references: {
        model: 'categories',
        key: 'slug'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    title: {
      type: Sequelize.STRING(200),
      allowNull: false
    },
    slug: {
      type: Sequelize.STRING(250),
      allowNull: true,
      unique: true,
    },
    share_code: {
      type: Sequelize.STRING(10),
      allowNull: true,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    price: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
    },
    price_negotiable: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    state_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    city_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    state_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    city_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    locality: {
      type: Sequelize.STRING(200),
      allowNull: true
    },
    pincode: {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Postal/ZIP code for location filtering'
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('draft', 'pending', 'active', 'expired', 'sold', 'rejected'),
      allowNull: false,
      defaultValue: 'draft'
    },
    is_featured: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    featured_until: {
      type: Sequelize.DATE,
      allowNull: true
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    published_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    approved_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    approved_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    rejected_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    rejected_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    rejection_reason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    view_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    contact_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_favorites: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    cover_image: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    cover_image_storage_type: {
      type: Sequelize.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
      allowNull: true
    },
    cover_image_mime_type: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    is_auto_approved: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    posted_by_type: {
      type: Sequelize.ENUM('owner', 'agent', 'dealer'),
      allowNull: false,
      defaultValue: 'owner',
    },
    user_subscription_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'user_subscriptions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    is_paid_listing: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
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
      allowNull: true,
      comment: 'Last updater only (high-volume table)'
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
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    keywords: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    republish_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_republished_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    republish_history: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    essential_data: {
      type: Sequelize.JSONB,
      allowNull: true,
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
    }
  });

  // Add indexes
  await queryInterface.addIndex('listings', ['user_id'], {
    name: 'idx_listings_user_id'
  });

  await queryInterface.addIndex('listings', ['category_id'], {
    name: 'idx_listings_category_id'
  });

  await queryInterface.addIndex('listings', ['category_slug'], {
    name: 'idx_listings_category_slug'
  });

  await queryInterface.addIndex('listings', ['state_id', 'city_id'], {
    name: 'idx_listings_state_city'
  });

  // Add indexes for subscription tracking and quota calculations
  await queryInterface.addIndex('listings', ['user_id', 'category_id', 'status', 'created_at'], {
    name: 'idx_listings_quota_check',
  });

  await queryInterface.addIndex('listings', ['user_subscription_id'], {
    name: 'idx_listings_subscription_id'
  });

  await queryInterface.addIndex('listings', ['is_paid_listing'], {
    name: 'idx_listings_paid_status',
    where: {
      is_paid_listing: true
    }
  });

  // Add index for republish tracking
  await queryInterface.addIndex('listings', ['last_republished_at'], {
    name: 'idx_listings_last_republished_at'
  });

  await queryInterface.addIndex('listings', ['share_code'], {
    name: 'idx_listings_share_code'
  });

  // Add GIN index for essential_data JSONB column
  await queryInterface.addIndex('listings', ['essential_data'], {
    name: 'idx_listings_essential_data',
    using: 'GIN'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('listings');
}
