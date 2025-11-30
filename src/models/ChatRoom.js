/**
 * ChatRoom Model
 * Chat conversations between buyers and sellers about listings
 */

import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const ChatRoom = sequelize.define(
  'ChatRoom',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    listingId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'listing_id'
    },
    buyerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'buyer_id'
    },
    sellerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'seller_id'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_message_at'
    },
    unreadCountBuyer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'unread_count_buyer'
    },
    unreadCountSeller: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'unread_count_seller'
    },
    isImportantBuyer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_important_buyer'
    },
    isImportantSeller: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_important_seller'
    },
    buyerSubscriptionTier: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'buyer_subscription_tier'
    },
    sellerSubscriptionTier: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'seller_subscription_tier'
    },
    buyerRequestedContact: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'buyer_requested_contact'
    },
    sellerSharedContact: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'seller_shared_contact'
    },
    blockedByBuyer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'blocked_by_buyer'
    },
    blockedBySeller: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'blocked_by_seller'
    },
    blockMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'block_metadata'
    },
    reportedByBuyer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'reported_by_buyer'
    },
    reportedBySeller: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'reported_by_seller'
    },
    reportMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'report_metadata'
    }
  },
  {
    sequelize,
    tableName: 'chat_rooms',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['listing_id', 'buyer_id'],
        name: 'unique_listing_buyer'
      }
    ]
  }
);

// Define associations
ChatRoom.associate = (models) => {
  // Belongs to Listing
  ChatRoom.belongsTo(models.Listing, {
    foreignKey: 'listing_id',
    as: 'listing'
  });

  // Belongs to User (Buyer)
  ChatRoom.belongsTo(models.User, {
    foreignKey: 'buyer_id',
    as: 'buyer'
  });

  // Belongs to User (Seller)
  ChatRoom.belongsTo(models.User, {
    foreignKey: 'seller_id',
    as: 'seller'
  });

  // Has many ChatMessages
  ChatRoom.hasMany(models.ChatMessage, {
    foreignKey: 'chat_room_id',
    as: 'messages'
  });

  // Has many ListingOffers
  ChatRoom.hasMany(models.ListingOffer, {
    foreignKey: 'chat_room_id',
    as: 'offers'
  });
};

export default ChatRoom;
