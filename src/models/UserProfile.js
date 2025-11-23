import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserProfile = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'dob'
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'gender'
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'about'
    },
    nameOnId: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'name_on_id'
    },
    businessName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'business_name'
    },
    gstin: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: 'gstin'
    },
    aadharNumber: {
      type: DataTypes.STRING(12),
      allowNull: true,
      field: 'aadhar_number'
    },
    panNumber: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'pan_number'
    },
    addressLine1: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'address_line1'
    },
    addressLine2: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'address_line2'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city'
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'state_id'
    },
    stateName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'state_name'
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'India',
      field: 'country'
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'pincode'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'latitude'
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'longitude'
    }
  }, {
    tableName: 'user_profiles',
    timestamps: true,
    underscored: true,
    paranoid: false
  });

  UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    UserProfile.belongsTo(models.State, {
      foreignKey: 'stateId',
      as: 'state'
    });
  };

  return UserProfile;
};
