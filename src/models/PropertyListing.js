/**
 * PropertyListing Model
 * Property-specific attributes for listings
 */

import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const PropertyListing = sequelize.define(
  'PropertyListing',
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
    propertyType: {
      type: DataTypes.ENUM('apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse'),
      allowNull: false,
      field: 'property_type'
    },
    listingType: {
      type: DataTypes.ENUM('sale', 'rent', 'pg', 'hostel'),
      allowNull: false,
      field: 'listing_type'
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'bedrooms'
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'bathrooms'
    },
    balconies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'balconies'
    },
    areaSqft: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'area_sqft'
    },
    plotAreaSqft: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'plot_area_sqft'
    },
    carpetAreaSqft: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'carpet_area_sqft'
    },
    floorNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'floor_number'
    },
    totalFloors: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'total_floors'
    },
    ageYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'age_years'
    },
    facing: {
      type: DataTypes.ENUM('north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'),
      allowNull: true,
      field: 'facing'
    },
    furnished: {
      type: DataTypes.ENUM('unfurnished', 'semi-furnished', 'fully-furnished'),
      allowNull: false,
      defaultValue: 'unfurnished',
      field: 'furnished'
    },
    parkingSpaces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'parking_spaces'
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'amenities'
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'available_from'
    },
    ownershipType: {
      type: DataTypes.ENUM('freehold', 'leasehold', 'co-operative'),
      allowNull: true,
      field: 'ownership_type'
    },
    reraApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'rera_approved'
    },
    reraId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'rera_id'
    }
  },
  {
    sequelize,
    tableName: 'property_listings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Define associations
PropertyListing.associate = (models) => {
  // Belongs to Listing
  PropertyListing.belongsTo(models.Listing, {
    foreignKey: 'listing_id',
    as: 'listing'
  });
};

export default PropertyListing;
