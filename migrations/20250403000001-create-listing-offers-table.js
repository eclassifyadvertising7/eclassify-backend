/**
 * Migration: Create listing_offers table
 * High-volume table for tracking price negotiations
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('listing_offers', {
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
    chat_room_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'chat_rooms',
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
    offered_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false
    },
    listing_price_at_time: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false
    },
    discount_percentage: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    parent_offer_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'listing_offers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'NULL = initial offer, NOT NULL = counter-offer'
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Values: pending, accepted, rejected, withdrawn, expired, countered'
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    viewed_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    responded_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    auto_rejected: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
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

  // Add indexes
  await queryInterface.addIndex('listing_offers', ['listing_id', 'created_at'], {
    name: 'idx_listing_offers_listing',
    order: [['created_at', 'DESC']]
  });

  await queryInterface.addIndex('listing_offers', ['chat_room_id', 'created_at'], {
    name: 'idx_listing_offers_room',
    order: [['created_at', 'DESC']]
  });

  await queryInterface.addIndex('listing_offers', ['buyer_id', 'status'], {
    name: 'idx_listing_offers_buyer'
  });

  await queryInterface.addIndex('listing_offers', ['seller_id', 'status'], {
    name: 'idx_listing_offers_seller'
  });

  await queryInterface.addIndex('listing_offers', ['status', 'expires_at'], {
    name: 'idx_listing_offers_status'
  });

  await queryInterface.addIndex('listing_offers', ['parent_offer_id'], {
    name: 'idx_listing_offers_parent'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('listing_offers');
}
