import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const UserFavorite = sequelize.define('UserFavorite', {
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
  listingId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'listing_id'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  tableName: 'user_favorites',
  underscored: true,
  timestamps: false, // We handle timestamps manually
  paranoid: true, // Enable soft deletes
  deletedAt: 'deletedAt',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['listing_id']
    },
    {
      unique: true,
      fields: ['user_id', 'listing_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['deleted_at']
    }
  ]
});

UserFavorite.addHook('afterCreate', async (favorite, options) => {
  const { Listing } = await import('#models/index.js').then(m => m.default);
  await Listing.increment('totalFavorites', {
    by: 1,
    where: { id: favorite.listingId },
    transaction: options.transaction
  });
});

UserFavorite.addHook('afterDestroy', async (favorite, options) => {
  try {
    const { Listing } = await import('#models/index.js').then(m => m.default);
    await Listing.decrement('totalFavorites', {
      by: 1,
      where: { id: favorite.listingId },
      transaction: options.transaction
    });
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.parent?.constraint === 'check_total_favorites_non_negative') {
      // Silently ignore constraint violation (already at 0)
    } else {
      throw error;
    }
  }
});

UserFavorite.addHook('afterRestore', async (favorite, options) => {
  const { Listing } = await import('#models/index.js').then(m => m.default);
  await Listing.increment('totalFavorites', {
    by: 1,
    where: { id: favorite.listingId },
    transaction: options.transaction
  });
});

// Define associations
UserFavorite.associate = (models) => {
  // Belongs to User
  UserFavorite.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Belongs to Listing
  UserFavorite.belongsTo(models.Listing, {
    foreignKey: 'listingId',
    as: 'listing'
  });
};

export default UserFavorite;