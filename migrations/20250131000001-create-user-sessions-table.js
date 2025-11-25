export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_sessions', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    refresh_token: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    fcm_token: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    device_id: {
      type: Sequelize.STRING(200),
      allowNull: true
    },
    device_name: {
      type: Sequelize.STRING(200),
      allowNull: true
    },
    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    ip_address_v4: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    ip_address_v6: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    login_method: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_active: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    expires_at: {
      type: Sequelize.DATE,
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

  // Create indexes
  await queryInterface.addIndex('user_sessions', ['user_id'], {
    name: 'idx_user_sessions_user_id'
  });

  await queryInterface.addIndex('user_sessions', ['refresh_token'], {
    name: 'idx_user_sessions_refresh_token'
  });

  await queryInterface.addIndex('user_sessions', ['expires_at'], {
    name: 'idx_user_sessions_expires_at'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('user_sessions');
}
