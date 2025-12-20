import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const UserSearch = sequelize.define('UserSearch', {
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
  searchQuery: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'search_query'
  },
  filtersApplied: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'filters_applied'
  },
  resultsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'results_count'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id'
  },
  locationFilters: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'location_filters'
  },
  priceRange: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'price_range'
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
  tableName: 'user_searches',
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
      fields: ['search_query']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['results_count']
    }
  ]
});

// Define associations
UserSearch.associate = (models) => {
  // Belongs to User (nullable for anonymous searches)
  UserSearch.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Belongs to Category
  UserSearch.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });
};

export default UserSearch;