/**
 * Listing Model
 * Base table for all listing types (cars, properties)
 */

import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';
import crypto from 'crypto';

const Listing = sequelize.define(
  'Listing',
  {
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
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'title'
    },
    slug: {
      type: DataTypes.STRING(250),
      allowNull: true,
      unique: true,
      field: 'slug'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'price'
    },
    priceNegotiable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'price_negotiable'
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'state_id'
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'city_id'
    },
    locality: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'locality'
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'pincode'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'address'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'latitude'
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'longitude'
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'expired', 'sold', 'rejected'),
      allowNull: false,
      defaultValue: 'draft',
      field: 'status'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_featured'
    },
    featuredUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'featured_until'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at'
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at'
    },
    approvedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'approved_by'
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'rejected_at'
    },
    rejectedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'rejected_by'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'view_count'
    },
    contactCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'contact_count'
    },
    isAutoApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_auto_approved'
    },
    postedByType: {
      type: DataTypes.ENUM('owner', 'agent', 'dealer'),
      allowNull: false,
      defaultValue: 'owner',
      field: 'posted_by_type'
    },
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
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  },
  {
    sequelize,
    tableName: 'listings',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: async (listing, options) => {
        // Generate unique slug from title
        if (!listing.slug && listing.title) {
          const baseSlug = listing.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          const randomSuffix = crypto.randomBytes(3).toString('hex');
          listing.slug = `${baseSlug}-${randomSuffix}`;
        }
      },
      beforeUpdate: async (listing, options) => {
        // Set updated_by from options
        if (options.userId) {
          listing.updatedBy = options.userId;
        }
      },
      beforeDestroy: async (listing, options) => {
        // Soft delete associated media (handled by CASCADE in DB)
        // Additional cleanup can be added here if needed
      }
    }
  }
);

// Define associations
Listing.associate = (models) => {
  // Belongs to User
  Listing.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Belongs to Category
  Listing.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category'
  });

  // Belongs to State
  Listing.belongsTo(models.State, {
    foreignKey: 'state_id',
    as: 'state'
  });

  // Belongs to City
  Listing.belongsTo(models.City, {
    foreignKey: 'city_id',
    as: 'city'
  });

  // Has one CarListing
  Listing.hasOne(models.CarListing, {
    foreignKey: 'listing_id',
    as: 'carListing'
  });

  // Has one PropertyListing
  Listing.hasOne(models.PropertyListing, {
    foreignKey: 'listing_id',
    as: 'propertyListing'
  });

  // Has many ListingMedia
  Listing.hasMany(models.ListingMedia, {
    foreignKey: 'listing_id',
    as: 'media'
  });

  // Approved by User
  Listing.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver'
  });

  // Rejected by User
  Listing.belongsTo(models.User, {
    foreignKey: 'rejected_by',
    as: 'rejecter'
  });
};

export default Listing;
