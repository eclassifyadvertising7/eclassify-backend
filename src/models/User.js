import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: "full_name",
      },
      countryCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: "+91",
        field: "country_code",
      },
      mobile: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
        field: "mobile",
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true,
        field: "email",
      },
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "password_hash",
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "role_id",
      },
      status: {
        type: DataTypes.ENUM("active", "blocked", "suspended", "deleted"),
        allowNull: false,
        defaultValue: "active",
        field: "status",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
      isPasswordReset: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_password_reset",
      },
      isPhoneVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_phone_verified",
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_email_verified",
      },
      phoneVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "phone_verified_at",
      },
      emailVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "email_verified_at",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login_at",
      },
      kycStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
        field: "kyc_status",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_verified",
      },
      subscriptionType: {
        type: DataTypes.ENUM("free", "paid"),
        allowNull: false,
        defaultValue: "free",
        field: "subscription_type",
      },
      subscriptionExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "subscription_expires_at",
      },
      maxDevices: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        field: "max_devices",
      },
      isAutoApproveEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_auto_approve_enabled",
      },
      createdBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "created_by",
      },
      deletedBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "deleted_by",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      paranoid: true,
      hooks: {
        beforeDestroy: async (user, options) => {
          user.status = "deleted";
          if (options.userId) {
            user.deletedBy = options.userId;
          }
          await user.save({ hooks: false });
        },
      },
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: "roleId",
      as: "role",
    });

    User.hasOne(models.UserProfile, {
      foreignKey: "userId",
      as: "profile",
    });

    User.hasMany(models.UserSession, {
      foreignKey: "userId",
      as: "sessions",
    });

    User.hasMany(models.UserSocialAccount, {
      foreignKey: "userId",
      as: "socialAccounts",
    });

    // Self-referencing associations
    User.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });

    User.belongsTo(models.User, {
      foreignKey: "deletedBy",
      as: "deleter",
    });
  };

  // Instance method to compare password
  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  };

  return User;
};
