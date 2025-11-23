import { Sequelize } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('car_brands', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      name_local: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      country_of_origin: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_popular: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      meta_title: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      meta_description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      meta_keywords: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      total_models: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_listings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_views: {
        type: Sequelize.BIGINT,
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
    await queryInterface.addIndex('car_brands', ['slug'], {
      name: 'idx_car_brands_slug'
    });

    await queryInterface.addIndex('car_brands', ['is_active', 'display_order'], {
      name: 'idx_car_brands_active_order'
    });

    await queryInterface.addIndex('car_brands', ['is_popular'], {
      name: 'idx_car_brands_popular'
    });

    await queryInterface.addIndex('car_brands', ['deleted_at'], {
      name: 'idx_car_brands_deleted_at'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('car_brands');
  }
};
