export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_location_preferences', {
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
      onDelete: 'CASCADE'
    },
    session_id: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    selected_state_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    selected_city_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    selected_address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    selected_lat: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    },
    selected_lng: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    },
    location_source: {
      type: Sequelize.ENUM('manual', 'browser', 'profile'),
      allowNull: false,
      defaultValue: 'manual'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    ip_address: {
      type: Sequelize.INET,
      allowNull: true
    },
    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true
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
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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
    deleted_at: {
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
  await queryInterface.addIndex('user_location_preferences', ['user_id', 'is_active'], {
    name: 'idx_user_location_preferences_user_active'
  });

  await queryInterface.addIndex('user_location_preferences', ['session_id'], {
    name: 'idx_user_location_preferences_session_id'
  });

  await queryInterface.addIndex('user_location_preferences', ['selected_state_id'], {
    name: 'idx_user_location_preferences_state_id'
  });

  await queryInterface.addIndex('user_location_preferences', ['selected_city_id'], {
    name: 'idx_user_location_preferences_city_id'
  });

  await queryInterface.addIndex('user_location_preferences', ['location_source'], {
    name: 'idx_user_location_preferences_source'
  });

  await queryInterface.addIndex('user_location_preferences', ['created_at'], {
    name: 'idx_user_location_preferences_created_at'
  });

  // Unique constraint: only one active location per user
  await queryInterface.addConstraint('user_location_preferences', {
    fields: ['user_id', 'is_active'],
    type: 'unique',
    name: 'unique_active_location_per_user',
    where: {
      is_active: true,
      user_id: {
        [Sequelize.Op.ne]: null
      }
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('user_location_preferences');
}