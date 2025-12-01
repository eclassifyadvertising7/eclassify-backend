import { Model, DataTypes } from "sequelize";
import sequelize from "#config/database.js";

class City extends Model {}

City.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "state_id",
    },
    districtId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "district_id",
    },
    stateName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "state_name",
    },
    district: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(12, 8),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "display_order",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "created_by",
    },
    updatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "updated_by",
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_deleted",
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "deleted_by",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
  },
  {
    sequelize,
    modelName: "City",
    tableName: "cities",
    timestamps: true,
    underscored: true,
    paranoid: false,
    indexes: [
      {
        name: "idx_cities_slug",
        fields: ["slug"],
      },
      {
        name: "idx_cities_state_id",
        fields: ["state_id"],
      },
      {
        name: "idx_cities_state_active",
        fields: ["state_id", "is_active"],
      },
    ],
  },
  {
    hooks: {
      beforeCreate: (city) => {
        if (!city.slug) {
          city.slug = city.name.toLowerCase().replace(/\s+/g, "-");
        }
      },
      beforeUpdate: (city) => {
        if (city.changed("name") && !city.changed("slug")) {
          city.slug = city.name.toLowerCase().replace(/\s+/g, "-");
        }
      },
    },
  }
);

// Associations
City.associate = (models) => {
  // City belongs to State
  City.belongsTo(models.State, {
    foreignKey: "state_id",
    as: "state",
  });

  // City belongs to District (optional)
  City.belongsTo(models.District, {
    foreignKey: "district_id",
    as: "districtInfo",
  });

  // TODO: Add Listing association when Listing model is created
  // City.hasMany(models.Listing, {
  //   foreignKey: "city_id",
  //   as: "listings",
  // });
};

export default City;
