import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const UserLocationPreference = sequelize.define('UserLocationPreference', {
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
    allowNull: true,
    field: 'session_id'
  },
  selectedStateId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'selected_state_id'
  },
  selectedCityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'selected_city_id'
  },
  selectedAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'selected_address'
  },
  selectedLat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    field: 'selected_lat'
  },
  selectedLng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    field: 'selected_lng'
  },
  locationSource: {
    type: DataTypes.ENUM('manual', 'browser', 'profile'),
    allowNull: false,
    defaultValue: 'manual',
    field: 'location_source'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'user_location_preferences',
  timestamps: true,
  underscored: true,
  paranoid: true,
  hooks: {
    beforeUpdate: async (instance, options) => {
      if (options.userId) {
        instance.updatedBy = options.userId;
      }
    },
    beforeDestroy: async (instance, options) => {
      if (options.userId) {
        instance.deletedBy = options.userId;
      }
    }
  },
  indexes: [
    {
      fields: ['user_id', 'is_active'],
      name: 'idx_user_location_preferences_user_active'
    },
    {
      fields: ['session_id'],
      name: 'idx_user_location_preferences_session_id'
    },
    {
      fields: ['selected_state_id'],
      name: 'idx_user_location_preferences_state_id'
    },
    {
      fields: ['selected_city_id'],
      name: 'idx_user_location_preferences_city_id'
    },
    {
      fields: ['location_source'],
      name: 'idx_user_location_preferences_source'
    },
    {
      fields: ['created_at'],
      name: 'idx_user_location_preferences_created_at'
    }
  ]
});

// Define associations
UserLocationPreference.associate = (models) => {
  // Belongs to User (nullable for anonymous users)
  UserLocationPreference.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Belongs to State
  UserLocationPreference.belongsTo(models.State, {
    foreignKey: 'selectedStateId',
    as: 'selectedState'
  });

  // Belongs to City
  UserLocationPreference.belongsTo(models.City, {
    foreignKey: 'selectedCityId',
    as: 'selectedCity'
  });

  // Audit associations
  UserLocationPreference.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  UserLocationPreference.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });

  UserLocationPreference.belongsTo(models.User, {
    foreignKey: 'deletedBy',
    as: 'deleter'
  });
};

export default UserLocationPreference;