import { Sequelize } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('user_activity_logs', {
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
      activity_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      target_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      target_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      metadata: {
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
    await queryInterface.addIndex('user_activity_logs', ['user_id', 'created_at'], {
      name: 'idx_activity_logs_user_created'
    });

    await queryInterface.addIndex('user_activity_logs', ['session_id'], {
      name: 'idx_activity_logs_session'
    });

    await queryInterface.addIndex('user_activity_logs', ['activity_type', 'created_at'], {
      name: 'idx_activity_logs_type_created'
    });

    await queryInterface.addIndex('user_activity_logs', ['target_id', 'target_type'], {
      name: 'idx_activity_logs_target'
    });

    await queryInterface.addIndex('user_activity_logs', ['created_at'], {
      name: 'idx_activity_logs_created'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_activity_logs');
  }
};