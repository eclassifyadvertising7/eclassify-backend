import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserSocialAccount = sequelize.define('UserSocialAccount', {
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
    provider: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'provider'
    },
    providerId: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'provider_id'
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'email'
    },
    profilePictureUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'profile_picture_url'
    },
    profilePictureStorageType: {
      type: DataTypes.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
      allowNull: true,
      field: 'profile_picture_storage_type'
    },
    profilePictureMimeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'profile_picture_mime_type'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_primary'
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'access_token'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token'
    }
  }, {
    tableName: 'user_social_accounts',
    timestamps: true,
    underscored: true,
    paranoid: false
  });

  UserSocialAccount.associate = (models) => {
    UserSocialAccount.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserSocialAccount;
};
