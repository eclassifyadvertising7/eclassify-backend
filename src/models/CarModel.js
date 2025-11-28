import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const CarModel = sequelize.define(
  'CarModel',
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name'
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      field: 'slug'
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
    launchYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'launch_year'
    },
    discontinuationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'discontinuation_year'
    },
    totalVariants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_variants'
    },
    totalListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_listings'
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
    tableName: 'car_models',
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
        // Cascade soft delete to variants
        const { CarVariant } = sequelize.models;
        
        // Soft delete all variants under this model
        await CarVariant.destroy({
          where: { model_id: instance.id },
          individualHooks: true,
          ...options
        });
      }
    }
  }
);

CarModel.associate = (models) => {
  CarModel.belongsTo(models.CarBrand, {
    foreignKey: 'brand_id',
    as: 'brand'
  });

  CarModel.hasMany(models.CarVariant, {
    foreignKey: 'model_id',
    as: 'variants'
  });

  CarModel.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  CarModel.belongsTo(models.User, {
    foreignKey: 'deleted_by',
    as: 'deleter'
  });
};

export default CarModel;
