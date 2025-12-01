import { Sequelize } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('car_variants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      variant_name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true
      },
      full_name: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      model_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      body_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fuel_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      transmission_type: {
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
      ex_showroom_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      price_range_min: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      price_range_max: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_discontinued: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      launch_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      discontinuation_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      primary_image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      primary_image_storage_type: {
        type: Sequelize.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
        allowNull: true
      },
      primary_image_mime_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      view_count: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      listing_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      popularity_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
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
    await queryInterface.addIndex('car_variants', ['brand_id'], {
      name: 'idx_car_variants_brand_id'
    });

    await queryInterface.addIndex('car_variants', ['model_id'], {
      name: 'idx_car_variants_model_id'
    });

    await queryInterface.addIndex('car_variants', ['slug'], {
      name: 'idx_car_variants_slug'
    });

    await queryInterface.addIndex('car_variants', ['is_active', 'model_id'], {
      name: 'idx_car_variants_active_model'
    });

    await queryInterface.addIndex('car_variants', ['model_year'], {
      name: 'idx_car_variants_model_year'
    });

    await queryInterface.addIndex('car_variants', ['fuel_type'], {
      name: 'idx_car_variants_fuel_type'
    });

    await queryInterface.addIndex('car_variants', ['transmission_type'], {
      name: 'idx_car_variants_transmission_type'
    });

    await queryInterface.addIndex('car_variants', ['popularity_score'], {
      name: 'idx_car_variants_popularity'
    });

    await queryInterface.addIndex('car_variants', ['deleted_at'], {
      name: 'idx_car_variants_deleted_at'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('car_variants');
  }
};
