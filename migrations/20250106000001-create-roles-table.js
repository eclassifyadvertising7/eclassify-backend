export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('roles', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    slug: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    priority: {
      type: Sequelize.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    is_system_role: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
  await queryInterface.addIndex('roles', ['slug'], {
    name: 'idx_roles_slug'
  });

  await queryInterface.addIndex('roles', ['is_active'], {
    name: 'idx_roles_is_active'
  });

  await queryInterface.addIndex('roles', ['deleted_at'], {
    name: 'idx_roles_deleted_at'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('roles');
}
