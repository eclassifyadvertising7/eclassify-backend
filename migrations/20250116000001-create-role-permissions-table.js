export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('role_permissions', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    permission_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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

  // Create unique constraint
  await queryInterface.addConstraint('role_permissions', {
    fields: ['role_id', 'permission_id'],
    type: 'unique',
    name: 'unique_role_permission'
  });

  // Create indexes
  await queryInterface.addIndex('role_permissions', ['role_id'], {
    name: 'idx_role_permissions_role_id'
  });

  await queryInterface.addIndex('role_permissions', ['permission_id'], {
    name: 'idx_role_permissions_permission_id'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('role_permissions');
}
