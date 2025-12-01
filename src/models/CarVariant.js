import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';
import { getFullUrl } from '#utils/storageHelper.js';

const CarVariant = sequelize.define(
  'CarVariant',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'brand_id'
    },
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'model_id'
    },
    variantName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'variant_name'
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
      field: 'slug'
    },
    fullName: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'full_name'
    },
    modelYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'model_year'
    },
    bodyType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'body_type'
    },
    fuelType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'fuel_type'
    },
    transmissionType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'transmission_type'
    },
    seatingCapacity: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'seating_capacity'
    },
    doorCount: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'door_count'
    },
    exShowroomPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'ex_showroom_price'
    },
    priceRangeMin: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'price_range_min'
    },
    priceRangeMax: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'price_range_max'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    isDiscontinued: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_discontinued'
    },
    launchDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'launch_date'
    },
    discontinuationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'discontinuation_date'
    },
    primaryImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'primary_image_url',
      get() {
        const rawValue = this.getDataValue('primaryImageUrl');
        const storageType = this.getDataValue('primaryImageStorageType');
        const mimeType = this.getDataValue('primaryImageMimeType');
        return getFullUrl(rawValue, storageType, mimeType);
      }
    },
    primaryImageStorageType: {
      type: DataTypes.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
      allowNull: true,
      field: 'primary_image_storage_type'
    },
    primaryImageMimeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'primary_image_mime_type'
    },
    viewCount: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      field: 'view_count'
    },
    listingCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'listing_count'
    },
    popularityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'popularity_score'
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
    tableName: 'car_variants',
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
      }
    }
  }
);

CarVariant.associate = (models) => {
  CarVariant.belongsTo(models.CarBrand, {
    foreignKey: 'brand_id',
    as: 'brand'
  });

  CarVariant.belongsTo(models.CarModel, {
    foreignKey: 'model_id',
    as: 'model'
  });

  CarVariant.hasOne(models.CarSpecification, {
    foreignKey: 'variant_id',
    as: 'specification'
  });

  CarVariant.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  CarVariant.belongsTo(models.User, {
    foreignKey: 'deleted_by',
    as: 'deleter'
  });
};

export default CarVariant;
