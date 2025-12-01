/**
 * Migration: Create chat_rooms table
 * High-volume table for chat conversations between buyers and sellers
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('chat_rooms', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    listing_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'listings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    buyer_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    seller_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_message_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    unread_count_buyer: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    unread_count_seller: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_important_buyer: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_important_seller: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    buyer_subscription_tier: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    seller_subscription_tier: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    buyer_requested_contact: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    seller_shared_contact: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    blocked_by_buyer: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    blocked_by_seller: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    block_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Structure: {buyer: {reason, blockedAt}, seller: {reason, blockedAt}}'
    },
    reported_by_buyer: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    reported_by_seller: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    report_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Array of reports: [{reportedBy, reportedUser, type, reason, reportedAt, status}]'
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
    }
  });

  // Add unique constraint
  await queryInterface.addConstraint('chat_rooms', {
    fields: ['listing_id', 'buyer_id'],
    type: 'unique',
    name: 'unique_listing_buyer'
  });

  // Add indexes
  await queryInterface.addIndex('chat_rooms', ['buyer_id', 'is_active'], {
    name: 'idx_chat_rooms_buyer'
  });

  await queryInterface.addIndex('chat_rooms', ['seller_id', 'is_active'], {
    name: 'idx_chat_rooms_seller'
  });

  await queryInterface.addIndex('chat_rooms', ['listing_id'], {
    name: 'idx_chat_rooms_listing'
  });

  await queryInterface.addIndex('chat_rooms', ['blocked_by_buyer', 'blocked_by_seller'], {
    name: 'idx_chat_rooms_blocked'
  });

  await queryInterface.addIndex('chat_rooms', ['reported_by_buyer', 'reported_by_seller'], {
    name: 'idx_chat_rooms_reported'
  });

  await queryInterface.addIndex('chat_rooms', ['last_message_at'], {
    name: 'idx_chat_rooms_last_message'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('chat_rooms');
}
