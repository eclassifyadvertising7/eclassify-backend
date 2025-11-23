import { Sequelize } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('car_specifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      variant: {
        type: Sequelize.STRING(150),
        allowNull: false
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
      ex_showroom_price: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Engine Specifications
      displacement_cc: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      cylinder_count: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      valves_per_cylinder: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      max_power: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      max_torque: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      engine_location: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      fuel_injection_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      // Transmission
      transmission_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      gear_count: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      drivetrain_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      // Fuel & Performance
      fuel_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fuel_tank_capacity: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      mileage_city: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      mileage_arai: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      emission_standard: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Dimensions
      length_mm: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      width_mm: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      height_mm: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      wheel_base: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      ground_clearance: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      kerb_weight: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      seating_capacity: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      door_count: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      // Suspension & Brakes
      front_suspension_type: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rear_suspension_type: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      front_brake_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      rear_brake_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Wheels & Tyres
      front_tyre_size: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      rear_tyre_size: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      wheel_size: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Steering & Additional Features
      power_steering: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      power_windows: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      odometer_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      speedometer_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Additional Info
      body_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Metadata for any additional fields
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // Audit fields
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.JSON,
        allowNull: true
      },
      deleted_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create indexes
    await queryInterface.addIndex('car_specifications', ['brand'], {
      name: 'idx_car_specs_brand'
    });

    await queryInterface.addIndex('car_specifications', ['model'], {
      name: 'idx_car_specs_model'
    });

    await queryInterface.addIndex('car_specifications', ['variant_id'], {
      name: 'idx_car_specs_variant_id'
    });

    await queryInterface.addIndex('car_specifications', ['brand', 'model', 'variant'], {
      name: 'idx_car_specs_brand_model_variant',
      unique: true
    });

    await queryInterface.addIndex('car_specifications', ['fuel_type'], {
      name: 'idx_car_specs_fuel_type'
    });

    await queryInterface.addIndex('car_specifications', ['transmission_type'], {
      name: 'idx_car_specs_transmission'
    });

    await queryInterface.addIndex('car_specifications', ['body_type'], {
      name: 'idx_car_specs_body_type'
    });

    await queryInterface.addIndex('car_specifications', ['deleted_at'], {
      name: 'idx_car_specs_deleted_at'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('car_specifications');
  }
};
