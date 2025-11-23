import { DataTypes, Model } from 'sequelize';
import sequelize from '#config/database.js';

class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'name'
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'slug'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
    },
    priority: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      field: 'priority'
    },
    isSystemRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_system_role'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'updated_by'
    },
    deletedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'deleted_by'
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['slug'], name: 'idx_roles_slug' },
      { fields: ['is_active'], name: 'idx_roles_is_active' },
      { fields: ['deleted_at'], name: 'idx_roles_deleted_at' }
    ],
    hooks: {
      beforeDestroy: async (role, options) => {
        if (role.isSystemRole) {
          throw new Error('System roles cannot be deleted');
        }
      },
      beforeUpdate: async (role, options) => {
        if (options.userId && options.userName) {
          const currentUpdates = role.updatedBy || [];
          role.updatedBy = [
            ...currentUpdates,
            {
              userId: options.userId,
              userName: options.userName,
              timestamp: new Date().toISOString()
            }
          ];
        }
      }
    }
  }
);

export default Role;
