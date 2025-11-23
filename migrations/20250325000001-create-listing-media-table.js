/**
 * Migration: Create listing_media table
 * High-volume table storing images and videos for listings
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('listing_media', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    listing_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'listings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    media_type: {
      type: Sequelize.ENUM('image', 'video'),
      allowNull: false,
      defaultValue: 'image'
    },
    media_url: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: 'Full size/original media URL'
    },
    thumbnail_url: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Thumbnail for images and videos'
    },
    file_size_bytes: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    width: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'For images only'
    },
    height: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'For images only'
    },
    duration_seconds: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'For videos only'
    },
    display_order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_primary: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Only ONE per listing'
    },
    storage_type: {
      type: Sequelize.ENUM('local', 'cloudinary', 's3'),
      allowNull: false,
      defaultValue: 'local'
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
  await queryInterface.addIndex('listing_media', ['listing_id'], {
    name: 'idx_listing_media_listing_id'
  });

  await queryInterface.addIndex('listing_media', ['media_type'], {
    name: 'idx_listing_media_media_type'
  });

  await queryInterface.addIndex('listing_media', ['listing_id', 'is_primary'], {
    name: 'idx_listing_media_is_primary'
  });

  await queryInterface.addIndex('listing_media', ['listing_id', 'display_order'], {
    name: 'idx_listing_media_display_order'
  });

  // Add unique constraint for display_order per listing
  await queryInterface.addConstraint('listing_media', {
    fields: ['listing_id', 'display_order'],
    type: 'unique',
    name: 'unique_listing_display_order'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('listing_media');
}
