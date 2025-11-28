import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const DataRequest = sequelize.define(
  'DataRequest',
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
    requestType: {
      type: DataTypes.ENUM('brand', 'model', 'variant', 'state', 'city'),
      allowNull: false,
      field: 'request_type'
    },
    brandName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'brand_name'
    },
    modelName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'model_name'
    },
    variantName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'variant_name'
    },
    stateName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'state_name'
    },
    cityName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city_name'
    },
    additionalDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'additional_details'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status'
    },
    reviewedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'reviewed_by'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    },
    createdBrandId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_brand_id'
    },
    createdModelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_model_id'
    },
    createdVariantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_variant_id'
    },
    createdStateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_state_id'
    },
    createdCityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_city_id'
    }
  },
  {
    sequelize,
    tableName: 'data_requests',
    timestamps: true,
    paranoid: false,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

DataRequest.associate = (models) => {
  DataRequest.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  DataRequest.belongsTo(models.User, {
    foreignKey: 'reviewed_by',
    as: 'reviewer'
  });

  DataRequest.belongsTo(models.CarBrand, {
    foreignKey: 'created_brand_id',
    as: 'createdBrand'
  });

  DataRequest.belongsTo(models.CarModel, {
    foreignKey: 'created_model_id',
    as: 'createdModel'
  });

  DataRequest.belongsTo(models.CarVariant, {
    foreignKey: 'created_variant_id',
    as: 'createdVariant'
  });

  DataRequest.belongsTo(models.State, {
    foreignKey: 'created_state_id',
    as: 'createdState'
  });

  DataRequest.belongsTo(models.City, {
    foreignKey: 'created_city_id',
    as: 'createdCity'
  });
};

export default DataRequest;
