import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('user_notifications', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    notification_type: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    category: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    title: {
      type: Sequelize.STRING(200),
      allowNull: false
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    data: {
      type: Sequelize.JSONB,
      allowNull: true
    },
    
    // Related entities (nullable - depends on notification type)
    listing_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'listings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    chat_room_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'chat_rooms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    subscription_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'user_subscriptions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    invoice_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'invoices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    transaction_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    
    // Status and tracking
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'unread'
    },
    priority: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'normal'
    },
    is_read: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    
    // Delivery method
    delivery_method: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'in_app'
    },
    
    // Scheduling and expiry
    scheduled_for: {
      type: Sequelize.DATE,
      allowNull: true
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    
    // Metadata
    metadata: {
      type: Sequelize.JSONB,
      allowNull: true
    },
    
    // Audit fields
    created_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    updated_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    deleted_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Create only the required indexes
  await queryInterface.addIndex('user_notifications', ['user_id'], {
    name: 'idx_user_notifications_user_id'
  });

  await queryInterface.addIndex('user_notifications', ['listing_id'], {
    name: 'idx_user_notifications_listing_id',
    where: {
      listing_id: {
        [Sequelize.Op.ne]: null
      }
    }
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('user_notifications');
};