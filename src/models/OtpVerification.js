import { DataTypes, Model } from 'sequelize';
import sequelize from '#config/database.js';

class OtpVerification extends Model {}

OtpVerification.init(
  {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'mobile'
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'email'
      },
      countryCode: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: '+91',
        field: 'country_code'
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: false,
        field: 'otp'
      },
      type: {
        type: DataTypes.ENUM('signup', 'login', 'password_reset', 'verification'),
        allowNull: false,
        field: 'type'
      },
      channel: {
        type: DataTypes.ENUM('sms', 'email', 'whatsapp', 'telegram', 'arattai', 'call'),
        allowNull: false,
        defaultValue: 'sms',
        field: 'channel'
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified'
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verified_at'
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
      },
      attempts: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: 'attempts'
      },
      resendCount: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: 'resend_count'
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address'
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent'
      },
      sessionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'session_id'
      }
  },
  {
    sequelize,
    modelName: 'OtpVerification',
    tableName: 'otp_verifications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['mobile', 'type', 'is_verified'],
        name: 'idx_otp_mobile_type_verified'
      },
      {
        fields: ['email', 'type', 'is_verified'],
        name: 'idx_otp_email_type_verified'
      },
      {
        fields: ['expires_at'],
        name: 'idx_otp_expires_at'
      },
      {
        fields: ['ip_address', 'created_at'],
        name: 'idx_otp_ip_created'
      }
    ]
  }
);

export default OtpVerification;
