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
      type: Sequelize.ENUM('apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse', 'pg', 'hostel'),
      allowNull: false
    },
    listing_type: {
      type: Sequelize.ENUM('sale', 'rent', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    bedrooms: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    bathrooms: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    balconies: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    area_sqft: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    plot_area_sqft: {
      type: Sequelize.INTEGER,
      allowNull: true
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
      allowNull: true
    },
    facing: {
      type: Sequelize.ENUM('north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'),
      allowNull: true
    },
    furnished: {
      type: Sequelize.ENUM('unfurnished', 'semi-furnished', 'fully-furnished'),
      allowNull: true
    },
    parking_spaces: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    amenities: {
      type: Sequelize.JSON,
      allowNull: true
    },
    available_from: {
      type: Sequelize.DATE,
      allowNull: true
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
    plot_length_ft: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    plot_width_ft: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    plot_elevation_ft: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    other_details: {
      type: Sequelize.JSONB,
      allowNull: true,
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
