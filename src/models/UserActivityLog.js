import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const UserActivityLog = sequelize.define('UserActivityLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'user_id'
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'session_id'
  },
  activityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'activity_type'
  },
  targetId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'target_id'
  },
  targetType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'target_type'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'metadata'
  },
  ipAddress: {
    type: DataTypes.INET,
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  }
}, {
  tableName: 'user_activity_logs',
  underscored: true,
  timestamps: false, // We only need createdAt, no updatedAt
  indexes: [
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['activity_type', 'created_at']
    },
    {
      fields: ['target_id', 'target_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Define associations
UserActivityLog.associate = (models) => {
  // Belongs to User (nullable for anonymous users)
  UserActivityLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Polymorphic association - can reference different target types
  // For listings
  UserActivityLog.belongsTo(models.Listing, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'listing',
    scope: {
      target_type: 'listing'
    }
  });
};

export default UserActivityLog;