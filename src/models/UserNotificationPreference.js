import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const UserNotificationPreference = sequelize.define('UserNotificationPreference', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    field: 'user_id'
  },
  
  // Global settings
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'notifications_enabled'
  },
  
  // Category preferences (user-configurable)
  listingNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'listing_notifications_enabled'
  },
  chatNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'chat_notifications_enabled'
  },
  subscriptionNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'subscription_notifications_enabled'
  },
  systemNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'system_notifications_enabled'
  },
  securityNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'security_notifications_enabled'
  },
  marketingNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'marketing_notifications_enabled'
  },
  
  // Channel preferences (backend-only, not exposed to users - for future flexibility)
  emailNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'email_notifications_enabled'
  },
  pushNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'push_notifications_enabled'
  },
  smsNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'sms_notifications_enabled'
  }
}, {
  tableName: 'user_notification_preferences',
  underscored: true,
  paranoid: false,
  timestamps: true
});

UserNotificationPreference.associate = (models) => {
  // User who owns these notification preferences
  UserNotificationPreference.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

export default UserNotificationPreference;