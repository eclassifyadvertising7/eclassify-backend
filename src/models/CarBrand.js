import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const CarBrand = sequelize.define(
  'CarBrand',
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
    nameLocal: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'name_local'
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'logo_url'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
    },
    countryOfOrigin: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'country_of_origin'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'display_order'
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_popular'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_featured'
    },
    metaTitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'meta_title'
    },
    metaDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'meta_description'
    },
    metaKeywords: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'meta_keywords'
    },
    totalModels: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_models'
    },
    totalListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_listings'
    },
    totalViews: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      field: 'total_views'
    },
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'updated_by'
    },
    deletedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'deleted_by'
    }
  },
  {
    sequelize,
    tableName: 'car_brands',
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeUpdate: async (instance, options) => {
        if (options.userId && options.userName) {
          const currentUpdates = instance.updatedBy || [];
          instance.updatedBy = [
            ...currentUpdates,
            {
              userId: options.userId,
              userName: options.userName,
              timestamp: new Date().toISOString()
            }
          ];
        }
      },
      beforeDestroy: async (instance, options) => {
        // Cascade soft delete to models and variants
        const { CarModel, CarVariant } = sequelize.models;
        
        // Soft delete all models under this brand
        await CarModel.destroy({
          where: { brand_id: instance.id },
          individualHooks: true,
          ...options
        });
        
        // Soft delete all variants under this brand
        await CarVariant.destroy({
          where: { brand_id: instance.id },
          individualHooks: true,
          ...options
        });
      }
    }
  }
);

CarBrand.associate = (models) => {
  CarBrand.hasMany(models.CarModel, {
    foreignKey: 'brand_id',
    as: 'models'
  });

  CarBrand.hasMany(models.CarVariant, {
    foreignKey: 'brand_id',
    as: 'variants'
  });

  CarBrand.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  CarBrand.belongsTo(models.User, {
    foreignKey: 'deleted_by',
    as: 'deleter'
  });
};

export default CarBrand;
