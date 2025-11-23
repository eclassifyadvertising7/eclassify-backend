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
      onDelete: 'RESTRICT'
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
    title: {
      type: Sequelize.STRING(200),
      allowNull: false
    },
    slug: {
      type: Sequelize.STRING(250),
      allowNull: true,
      unique: true,
      comment: 'Auto-generated URL-friendly identifier'
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
    locality: {
      type: Sequelize.STRING(200),
      allowNull: true
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
      comment: 'Auto-set to 30 days from approval'
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

  await queryInterface.addIndex('listings', ['status'], {
    name: 'idx_listings_status'
  });

  await queryInterface.addIndex('listings', ['state_id', 'city_id'], {
    name: 'idx_listings_state_city'
  });

  await queryInterface.addIndex('listings', ['slug'], {
    name: 'idx_listings_slug'
  });

  await queryInterface.addIndex('listings', ['is_featured', 'featured_until'], {
    name: 'idx_listings_featured'
  });

  await queryInterface.addIndex('listings', ['expires_at'], {
    name: 'idx_listings_expires_at'
  });

  await queryInterface.addIndex('listings', ['deleted_at'], {
    name: 'idx_listings_deleted_at'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('listings');
}
