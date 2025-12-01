import { Model, DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

class District extends Model {}

District.init(
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
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'state_id'
    },
    stateName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'state_name'
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
    modelName: 'District',
    tableName: 'districts',
    timestamps: true,
    underscored: true,
    paranoid: false,
    indexes: [
      {
        name: 'idx_districts_slug',
        fields: ['slug']
      },
      {
        name: 'idx_districts_state_id',
        fields: ['state_id']
      },
      {
        name: 'idx_districts_state_active',
        fields: ['state_id', 'is_active']
      }
    ]
  },
  {
    hooks: {
      beforeCreate: (district) => {
        if (!district.slug) {
          district.slug = district.name.toLowerCase().replace(/\s+/g, '-');
        }
      },
      beforeUpdate: (district) => {
        if (district.changed('name') && !district.changed('slug')) {
          district.slug = district.name.toLowerCase().replace(/\s+/g, '-');
        }
      }
    }
  }
);

// Associations
District.associate = (models) => {
  // District belongs to State
  District.belongsTo(models.State, {
    foreignKey: 'state_id',
    as: 'state'
  });

  // District has many Cities
  District.hasMany(models.City, {
    foreignKey: 'district_id',
    as: 'cities'
  });
};

export default District;
