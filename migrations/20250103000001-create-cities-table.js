export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("cities", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    slug: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    state_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "states",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    district_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "districts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    state_name: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    district: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    locality: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    pincode: {
      type: Sequelize.STRING(10),
      allowNull: true,
    },
    latitude: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    },
    longitude: {
      type: Sequelize.DECIMAL(12, 8),
      allowNull: true,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    display_order: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    is_popular: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    deleted_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  // Add indexes
  await queryInterface.addIndex("cities", ["slug"], {
    name: "idx_cities_slug",
  });

  await queryInterface.addIndex("cities", ["state_id"], {
    name: "idx_cities_state_id",
  });

  await queryInterface.addIndex("cities", ["state_id", "is_active"], {
    name: "idx_cities_state_active",
  });

  await queryInterface.addIndex("cities", ["is_popular", "is_active"], {
    name: "idx_cities_popular_active"
  });

  await queryInterface.addIndex("cities", ["state_id", "is_popular", "is_active"], {
    name: "idx_cities_state_popular_active"
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("cities");
}
