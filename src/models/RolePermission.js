import { DataTypes, Model } from 'sequelize';
import sequelize from '#config/database.js';

class RolePermission extends Model {}

RolePermission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id'
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'permission_id'
    }
  },
  {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    timestamps: true,
    underscored: true,
    paranoid: false,
    indexes: [
      { fields: ['role_id'], name: 'idx_role_permissions_role_id' },
      { fields: ['permission_id'], name: 'idx_role_permissions_permission_id' },
      { 
        fields: ['role_id', 'permission_id'], 
        unique: true, 
        name: 'unique_role_permission' 
      }
    ]
  }
);

export default RolePermission;
