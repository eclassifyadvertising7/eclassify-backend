export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('data_requests', {
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
    request_type: {
      type: Sequelize.ENUM('brand', 'model', 'variant', 'state', 'city'),
      allowNull: false
    },
    brand_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    model_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    variant_name: {
      type: Sequelize.STRING(150),
      allowNull: true
    },
    state_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    city_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    additional_details: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reviewed_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    reviewed_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    created_brand_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'car_brands',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_model_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'car_models',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_variant_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'car_variants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_state_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_city_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'cities',
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
    }
  });

  // Add indexes
  await queryInterface.addIndex('data_requests', ['user_id']);
  await queryInterface.addIndex('data_requests', ['status']);
  await queryInterface.addIndex('data_requests', ['request_type']);
  await queryInterface.addIndex('data_requests', ['reviewed_by']);
  await queryInterface.addIndex('data_requests', ['created_at']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('data_requests');
}
