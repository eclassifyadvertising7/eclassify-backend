import { Model, DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

class State extends Model {}

State.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    regionSlug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'region_slug'
    },
    regionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'region_name'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order'
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_popular'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'updated_by'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted'
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'deleted_by'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  },
  {
    sequelize,
    modelName: 'State',
    tableName: 'states',
    timestamps: true,
    underscored: true,
    paranoid: false,
    indexes: [
      {
        name: 'idx_states_slug',
        fields: ['slug']
      },
      {
        name: 'idx_states_popular_active',
        fields: ['is_popular', 'is_active']
      }
    ]
  },
  {
    hooks: {
      beforeCreate: (state) => {
        if (!state.slug) {
          state.slug = state.name.toLowerCase().replace(/\s+/g, '_');
        }
      },
      beforeUpdate: (state) => {
        if (state.changed('name') && !state.changed('slug')) {
          state.slug = state.name.toLowerCase().replace(/\s+/g, '_');
        }
      }
    }
  }
);

// Associations
State.associate = (models) => {
  // State has many Districts
  State.hasMany(models.District, {
    foreignKey: 'state_id',
    as: 'districts'
  });

  // State has many Cities
  State.hasMany(models.City, {
    foreignKey: 'state_id',
    as: 'cities'
  });

  // TODO: Add Listing association when Listing model is created
  // State.hasMany(models.Listing, {
  //   foreignKey: 'state_id',
  //   as: 'listings'
  // });
};

export default State;
