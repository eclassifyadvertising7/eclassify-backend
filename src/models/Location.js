import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  placeId: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'place_id'
  },
  provider: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  parentId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'parent_id'
  },
  name: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  locality: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  location: {
    type: DataTypes.GEOGRAPHY('POINT', 4326),
    allowNull: true
  },
  formattedAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'formatted_address'
  },
  types: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  addressComponents: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'address_components'
  },
  rawResponse: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'raw_response'
  },
  matchedStateId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'matched_state_id'
  },
  matchedCityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'matched_city_id'
  },
  matchConfidence: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'match_confidence'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'usage_count'
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_used_at'
  },
  createdBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'created_by'
  },
  updatedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'updated_by'
  }
}, {
  sequelize,
  tableName: 'locations',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Location.associate = (models) => {
  Location.belongsTo(models.Location, {
    foreignKey: 'parentId',
    as: 'parent'
  });

  Location.hasMany(models.Location, {
    foreignKey: 'parentId',
    as: 'children'
  });

  Location.belongsTo(models.State, {
    foreignKey: 'matchedStateId',
    as: 'matchedState'
  });

  Location.belongsTo(models.City, {
    foreignKey: 'matchedCityId',
    as: 'matchedCity'
  });

  Location.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  Location.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });
};

export default Location;
