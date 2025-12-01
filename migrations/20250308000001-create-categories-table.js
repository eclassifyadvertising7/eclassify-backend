/**
 * Migration: Create categories table
 * Small lookup table for listing categories (cars, properties, etc.)
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('categories', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
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
    icon: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Relative path to icon image'
    },
    icon_mime_type: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    image_url: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Relative path to category banner/image'
    },
    image_mime_type: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    storage_type: {
      type: Sequelize.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
      allowNull: true,
    },
    display_order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_featured: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of update history: [{userId, userName, timestamp}]'
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
  await queryInterface.addIndex('categories', ['slug'], {
    name: 'idx_categories_slug'
  });

  await queryInterface.addIndex('categories', ['is_active'], {
    name: 'idx_categories_is_active'
  });

  await queryInterface.addIndex('categories', ['is_featured'], {
    name: 'idx_categories_is_featured'
  });

  await queryInterface.addIndex('categories', ['display_order'], {
    name: 'idx_categories_display_order'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('categories');
}
