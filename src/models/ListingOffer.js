/**
 * ListingOffer Model
 * Price negotiations between buyers and sellers
 */

import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const ListingOffer = sequelize.define(
  'ListingOffer',
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
    chatRoomId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'chat_room_id'
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
    offeredAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'offered_amount'
    },
    listingPriceAtTime: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'listing_price_at_time'
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'discount_percentage'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes'
    },
    parentOfferId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'parent_offer_id'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'status'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at'
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'viewed_at'
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'responded_at'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    },
    autoRejected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_rejected'
    }
  },
  {
    sequelize,
    tableName: 'listing_offers',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (offer, options) => {
        // Calculate discount percentage
        if (offer.offeredAmount && offer.listingPriceAtTime) {
          const discount = ((offer.listingPriceAtTime - offer.offeredAmount) / offer.listingPriceAtTime) * 100;
          offer.discountPercentage = Math.round(discount * 100) / 100; // Round to 2 decimals
        }
      }
    }
  }
);

// Define associations
ListingOffer.associate = (models) => {
  // Belongs to Listing
  ListingOffer.belongsTo(models.Listing, {
    foreignKey: 'listing_id',
    as: 'listing'
  });

  // Belongs to ChatRoom
  ListingOffer.belongsTo(models.ChatRoom, {
    foreignKey: 'chat_room_id',
    as: 'chatRoom'
  });

  // Belongs to User (Buyer)
  ListingOffer.belongsTo(models.User, {
    foreignKey: 'buyer_id',
    as: 'buyer'
  });

  // Belongs to User (Seller)
  ListingOffer.belongsTo(models.User, {
    foreignKey: 'seller_id',
    as: 'seller'
  });

  // Self-referencing for counter-offers
  ListingOffer.belongsTo(models.ListingOffer, {
    foreignKey: 'parent_offer_id',
    as: 'parentOffer'
  });

  ListingOffer.hasMany(models.ListingOffer, {
    foreignKey: 'parent_offer_id',
    as: 'counterOffers'
  });
};

export default ListingOffer;
