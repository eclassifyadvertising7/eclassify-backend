/**
 * Migration: Create car_listings table
 * High-volume table storing car-specific attributes
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('car_listings', {
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
    brand_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'car_brands',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    brand_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Denormalized brand name for faster queries'
    },
    model_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'car_models',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    model_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Denormalized model name for faster queries'
    },
    variant_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'car_variants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    variant_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Denormalized variant name for faster queries'
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Manufacturing year'
    },
    registration_year: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    condition: {
      type: Sequelize.ENUM('new', 'used'),
      allowNull: false,
      defaultValue: 'used'
    },
    mileage_km: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Mileage in kilometers'
    },
    owners_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fuel_type: {
      type: Sequelize.ENUM('petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'),
      allowNull: false
    },
    transmission: {
      type: Sequelize.ENUM('manual', 'automatic', 'cvt', 'semi-automatic'),
      allowNull: false
    },
    body_type: {
      type: Sequelize.ENUM('sedan', 'hatchback', 'suv', 'coupe', 'convertible', 'wagon', 'pickup', 'van', 'truck'),
      allowNull: true
    },
    color: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    engine_capacity_cc: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Engine capacity in CC'
    },
    power_bhp: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Engine power in BHP'
    },
    seats: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    registration_number: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    registration_state_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    vin_number: {
      type: Sequelize.STRING(17),
      allowNull: true,
      comment: 'Vehicle Identification Number'
    },
    insurance_valid_until: {
      type: Sequelize.DATE,
      allowNull: true
    },
    features: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of features: ["ABS", "Airbags", "Sunroof", etc.]'
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
  await queryInterface.addIndex('car_listings', ['listing_id'], {
    name: 'idx_car_listings_listing_id'
  });

  await queryInterface.addIndex('car_listings', ['brand_id', 'model_id'], {
    name: 'idx_car_listings_brand_model'
  });

  await queryInterface.addIndex('car_listings', ['year'], {
    name: 'idx_car_listings_year'
  });

  await queryInterface.addIndex('car_listings', ['fuel_type', 'transmission'], {
    name: 'idx_car_listings_fuel_transmission'
  });

  await queryInterface.addIndex('car_listings', ['brand_name'], {
    name: 'idx_car_listings_brand_name'
  });

  await queryInterface.addIndex('car_listings', ['model_name'], {
    name: 'idx_car_listings_model_name'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('car_listings');
}
