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
      type: DataTypes.ENUM('apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse', 'pg', 'hostel'),
      allowNull: false,
      field: 'property_type'
    },
    listingType: {
      type: DataTypes.ENUM('sale', 'rent', 'other'),
      allowNull: false,
      defaultValue: 'other',
      field: 'listing_type'
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'bedrooms',
      comment: 'Number of bedrooms (for filtering/sorting)'
    },
    unitType: {
      type: DataTypes.ENUM('1rk', '1bhk', '2bhk', '3bhk', '4bhk', 'studio', 'penthouse', '1bed', '1room', 'custom'),
      allowNull: true,
      field: 'unit_type',
      comment: 'Property unit configuration type'
    },
    customUnitType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'custom_unit_type',
      comment: 'Custom unit type when unit_type is "custom"'
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'bathrooms'
    },
    balconies: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      allowNull: true,
      field: 'furnished'
    },
    parkingSpaces: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parking_spaces'
    },
    washrooms: { // For commercial
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'washrooms'
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'amenities'
    },
    foodIncluded: { // For PG/Hostel
      type: DataTypes.ENUM('yes', 'no', 'optional'),
      allowNull: true,
      field: 'food_included'
    },
    genderPreference: { // For PG/Hostel
      type: DataTypes.ENUM('male', 'female', 'any'),
      allowNull: true,
      field: 'gender_preference'
    },
    boundaryWall: { // For plot
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'boundary_wall'
    },
    cornerPlot: { // For plot
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'corner_plot'
    },
    gatedCommunity: { // For plot
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'gated_community'
    },
    coveredAreaSqft: { // For warehouse
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'covered_area_sqft'
    },
    openAreaSqft: { // For warehouse
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'open_area_sqft'
    },
    ceilingHeightFt: { // For warehouse
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'ceiling_height_ft'
    },
    loadingDocks: { // For warehouse
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'loading_docks'
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
    },
    plotLengthFt: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'plot_length_ft'
    },
    plotWidthFt: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'plot_width_ft'
    },
    plotElevationFt: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'plot_elevation_ft'
    },
    otherDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'other_details'
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
