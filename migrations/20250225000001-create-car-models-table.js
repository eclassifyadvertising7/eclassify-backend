import { Sequelize } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('car_models', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
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
      launch_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      discontinuation_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      total_variants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_listings: {
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
    await queryInterface.addIndex('car_models', ['brand_id'], {
      name: 'idx_car_models_brand_id'
    });

    await queryInterface.addIndex('car_models', ['slug'], {
      name: 'idx_car_models_slug'
    });

    await queryInterface.addIndex('car_models', ['is_active', 'brand_id'], {
      name: 'idx_car_models_active_brand'
    });

    await queryInterface.addIndex('car_models', ['deleted_at'], {
      name: 'idx_car_models_deleted_at'
    });

    await queryInterface.addIndex('car_models', ['brand_id', 'name'], {
      name: 'idx_car_models_brand_name',
      unique: true,
      where: {
        deleted_at: null
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('car_models');
  }
};
