/**
 * CarListing Model
 * Car-specific attributes for listings
 */

import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const CarListing = sequelize.define(
  'CarListing',
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
      unique: true,
      field: 'listing_id'
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
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'variant_id'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'year'
    },
    registrationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'registration_year'
    },
    condition: {
      type: DataTypes.ENUM('new', 'used'),
      allowNull: false,
      defaultValue: 'used',
      field: 'condition'
    },
    mileageKm: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'mileage_km'
    },
    ownersCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'owners_count'
    },
    fuelType: {
      type: DataTypes.ENUM('petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'),
      allowNull: false,
      field: 'fuel_type'
    },
    transmission: {
      type: DataTypes.ENUM('manual', 'automatic', 'cvt', 'semi-automatic'),
      allowNull: false,
      field: 'transmission'
    },
    bodyType: {
      type: DataTypes.ENUM('sedan', 'hatchback', 'suv', 'coupe', 'convertible', 'wagon', 'pickup', 'van', 'truck'),
      allowNull: true,
      field: 'body_type'
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'color'
    },
    engineCapacityCc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'engine_capacity_cc'
    },
    powerBhp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'power_bhp'
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: 'seats'
    },
    registrationNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'registration_number'
    },
    registrationStateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'registration_state_id'
    },
    vinNumber: {
      type: DataTypes.STRING(17),
      allowNull: true,
      field: 'vin_number'
    },
    insuranceValidUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'insurance_valid_until'
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'features'
    }
  },
  {
    sequelize,
    tableName: 'car_listings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Define associations
CarListing.associate = (models) => {
  // Belongs to Listing
  CarListing.belongsTo(models.Listing, {
    foreignKey: 'listing_id',
    as: 'listing'
  });

  // Belongs to CarBrand
  CarListing.belongsTo(models.CarBrand, {
    foreignKey: 'brand_id',
    as: 'brand'
  });

  // Belongs to CarModel
  CarListing.belongsTo(models.CarModel, {
    foreignKey: 'model_id',
    as: 'model'
  });

  // Belongs to CarVariant (optional)
  CarListing.belongsTo(models.CarVariant, {
    foreignKey: 'variant_id',
    as: 'variant'
  });

  // Belongs to State (registration)
  CarListing.belongsTo(models.State, {
    foreignKey: 'registration_state_id',
    as: 'registrationState'
  });
};

export default CarListing;
