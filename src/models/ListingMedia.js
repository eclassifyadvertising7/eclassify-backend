/**
 * ListingMedia Model
 * Images and videos for listings
 */

import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';
import { getFullUrl } from '#utils/storageHelper.js';

const ListingMedia = sequelize.define(
  'ListingMedia',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    listingId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'listing_id'
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
      defaultValue: 'image',
      field: 'media_type'
    },
    mediaUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'media_url',
      get() {
        const rawValue = this.getDataValue('mediaUrl');
        return getFullUrl(rawValue);
      }
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'thumbnail_url',
      get() {
        const rawValue = this.getDataValue('thumbnailUrl');
        return getFullUrl(rawValue);
      }
    },
    fileSizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size_bytes'
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'width'
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'height'
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'duration_seconds'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'display_order'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_primary'
    },
    storageType: {
      type: DataTypes.ENUM('local', 'cloudinary', 's3'),
      allowNull: false,
      defaultValue: 'local',
      field: 'storage_type'
    }
  },
  {
    sequelize,
    tableName: 'listing_media',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeDestroy: async (media, options) => {
        // Delete files from storage (local/cloudinary/s3)
        // This will be implemented in the service layer
        // Hook is here as a placeholder for future implementation
      }
    }
  }
);

// Define associations
ListingMedia.associate = (models) => {
  // Belongs to Listing
  ListingMedia.belongsTo(models.Listing, {
    foreignKey: 'listing_id',
    as: 'listing'
  });
};

export default ListingMedia;
