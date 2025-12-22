import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const UserNotification = sequelize.define('UserNotification', {
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
  notificationType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'notification_type'
  },
  category: {
    type: DataTypes.STRING(30),
    allowNull: false,
    field: 'category'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'title'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message'
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'data'
  },
  
  // Related entities
  listingId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'listing_id'
  },
  chatRoomId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'chat_room_id'
  },
  subscriptionId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'subscription_id'
  },
  invoiceId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'invoice_id'
  },
  transactionId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'transaction_id'
  },
  
  // Status and tracking
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unread',
    field: 'status'
  },
  priority: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'normal',
    field: 'priority'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_read'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  },
  
  // Delivery method
  deliveryMethod: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'in_app',
    field: 'delivery_method'
  },
  
  // Scheduling and expiry
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'scheduled_for'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'metadata'
  },
  
  // Audit fields
  createdBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'created_by'
  },
  updatedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'updated_by'
  },
  deletedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'deleted_by'
  }
}, {
  tableName: 'user_notifications',
  underscored: true,
  paranoid: true,
  timestamps: true,
  hooks: {
    beforeUpdate: async (instance, options) => {
      if (options.userId) {
        instance.updatedBy = options.userId;
      }
    }
  }
});

UserNotification.associate = (models) => {
  // User who receives the notification
  UserNotification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Related entities (optional associations)
  UserNotification.belongsTo(models.Listing, {
    foreignKey: 'listingId',
    as: 'listing'
  });

  UserNotification.belongsTo(models.ChatRoom, {
    foreignKey: 'chatRoomId',
    as: 'chatRoom'
  });

  UserNotification.belongsTo(models.UserSubscription, {
    foreignKey: 'subscriptionId',
    as: 'subscription'
  });

  UserNotification.belongsTo(models.Invoice, {
    foreignKey: 'invoiceId',
    as: 'invoice'
  });

  UserNotification.belongsTo(models.Transaction, {
    foreignKey: 'transactionId',
    as: 'transaction'
  });

  // Audit field associations
  UserNotification.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  UserNotification.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });

  UserNotification.belongsTo(models.User, {
    foreignKey: 'deletedBy',
    as: 'deleter'
  });
};

export default UserNotification;