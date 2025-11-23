import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'refresh_token'
    },
    fcmToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'fcm_token'
    },
    deviceId: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'device_id'
    },
    deviceName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'device_name'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent'
    },
    ipAddressV4: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: 'ip_address_v4'
    },
    ipAddressV6: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address_v6'
    },
    loginMethod: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'login_method'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    lastActive: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_active'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at'
    }
  }, {
    tableName: 'user_sessions',
    timestamps: true,
    underscored: true,
    paranoid: false
  });

  UserSession.associate = (models) => {
    UserSession.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserSession;
};
