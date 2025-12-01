export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('permissions', {
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
    resource: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    action: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_by: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    updated_by: {
      type: Sequelize.JSON,
      allowNull: true
    },
    deleted_by: {
      type: Sequelize.BIGINT,
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
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Create indexes
  await queryInterface.addIndex('permissions', ['slug'], {
    name: 'idx_permissions_slug'
  });

  await queryInterface.addIndex('permissions', ['resource', 'action'], {
    name: 'idx_permissions_resource_action',
    unique: true
  });

  await queryInterface.addIndex('permissions', ['is_active'], {
    name: 'idx_permissions_is_active'
  });

  await queryInterface.addIndex('permissions', ['deleted_at'], {
    name: 'idx_permissions_deleted_at'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('permissions');
}
