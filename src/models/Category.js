/**
 * Category Model
 * Represents listing categories (cars, properties, etc.)
 */

import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'icon',
      comment: 'Relative path to icon image'
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'image_url',
      comment: 'Relative path to category banner/image'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'display_order'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_featured'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'updated_by',
      comment: 'Array of update history: [{userId, userName, timestamp}]'
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
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
);

// Define associations
Category.associate = (models) => {
  // Has many Listings
  Category.hasMany(models.Listing, {
    foreignKey: 'category_id',
    as: 'listings'
  });
};

export default Category;
