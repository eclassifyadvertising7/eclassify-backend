export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('states', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    slug: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    region_slug: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    region_name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    display_order: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    updated_by: {
      type: Sequelize.JSON,
      allowNull: true
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    deleted_by: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Add indexes
  await queryInterface.addIndex('states', ['slug'], {
    name: 'idx_states_slug'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('states');
}
