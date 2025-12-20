import { Sequelize } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('user_searches', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      session_id: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      search_query: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      filters_applied: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      results_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      location_filters: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      price_range: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for performance
    await queryInterface.addIndex('user_searches', ['user_id', 'created_at'], {
      name: 'idx_user_searches_user_created'
    });

    await queryInterface.addIndex('user_searches', ['session_id'], {
      name: 'idx_user_searches_session'
    });

    await queryInterface.addIndex('user_searches', ['search_query'], {
      name: 'idx_user_searches_query'
    });

    await queryInterface.addIndex('user_searches', ['category_id'], {
      name: 'idx_user_searches_category'
    });

    await queryInterface.addIndex('user_searches', ['created_at'], {
      name: 'idx_user_searches_created'
    });

    await queryInterface.addIndex('user_searches', ['results_count'], {
      name: 'idx_user_searches_results_count'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_searches');
  }
};