/**
 * Migration: Create property_listings table
 * High-volume table storing property-specific attributes
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('property_listings', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    listing_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      unique: true,
      references: {
        model: 'listings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    property_type: {
      type: Sequelize.ENUM('apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse'),
      allowNull: false
    },
    listing_type: {
      type: Sequelize.ENUM('sale', 'rent', 'pg', 'hostel'),
      allowNull: false
    },
    bedrooms: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'NULL for plots/commercial'
    },
    bathrooms: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    balconies: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    area_sqft: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Total area in square feet'
    },
    plot_area_sqft: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'For houses/villas'
    },
    carpet_area_sqft: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    floor_number: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    total_floors: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    age_years: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Property age in years'
    },
    facing: {
      type: Sequelize.ENUM('north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'),
      allowNull: true
    },
    furnished: {
      type: Sequelize.ENUM('unfurnished', 'semi-furnished', 'fully-furnished'),
      allowNull: false,
      defaultValue: 'unfurnished'
    },
    parking_spaces: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    amenities: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of amenities: ["gym", "pool", "security", etc.]'
    },
    available_from: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Move-in date for rent/pg/hostel'
    },
    ownership_type: {
      type: Sequelize.ENUM('freehold', 'leasehold', 'co-operative'),
      allowNull: true
    },
    rera_approved: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    rera_id: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Add indexes
  await queryInterface.addIndex('property_listings', ['listing_id'], {
    name: 'idx_property_listings_listing_id'
  });

  await queryInterface.addIndex('property_listings', ['property_type'], {
    name: 'idx_property_listings_property_type'
  });

  await queryInterface.addIndex('property_listings', ['listing_type'], {
    name: 'idx_property_listings_listing_type'
  });

  await queryInterface.addIndex('property_listings', ['bedrooms'], {
    name: 'idx_property_listings_bedrooms'
  });

  await queryInterface.addIndex('property_listings', ['area_sqft'], {
    name: 'idx_property_listings_area'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('property_listings');
}
