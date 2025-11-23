import { DataTypes, Model } from 'sequelize';
import sequelize from '#config/database.js';

class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'name'
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'slug'
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'resource'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'action'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
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
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['slug'], name: 'idx_permissions_slug' },
      { fields: ['resource', 'action'], name: 'idx_permissions_resource_action' },
      { fields: ['is_active'], name: 'idx_permissions_is_active' },
      { fields: ['deleted_at'], name: 'idx_permissions_deleted_at' }
    ],
    hooks: {
      beforeCreate: async (permission, options) => {
        if (!permission.slug && permission.resource && permission.action) {
          permission.slug = `${permission.resource}.${permission.action}`;
        }
      },
      beforeUpdate: async (permission, options) => {
        // Auto-generate slug if resource or action changes
        if (permission.changed('resource') || permission.changed('action')) {
          permission.slug = `${permission.resource}.${permission.action}`;
        }
        
        // Track update history
        if (options.userId && options.userName) {
          const currentUpdates = permission.updatedBy || [];
          permission.updatedBy = [
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

export default Permission;
