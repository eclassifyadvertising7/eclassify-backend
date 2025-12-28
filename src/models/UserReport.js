import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const UserReport = sequelize.define('UserReport', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  reportedUserId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'reported_user_id'
  },
  reportedBy: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'reported_by'
  },
  reportType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'report_type'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  context: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  relatedListingId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'related_listing_id'
  },
  relatedChatRoomId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'related_chat_room_id'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending'
  },
  reviewedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'reviewed_by'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_notes'
  },
  actionTaken: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'action_taken'
  }
}, {
  sequelize,
  tableName: 'user_reports',
  timestamps: true,
  underscored: true,
  paranoid: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

UserReport.associate = (models) => {
  UserReport.belongsTo(models.User, {
    foreignKey: 'reported_user_id',
    as: 'reportedUser'
  });

  UserReport.belongsTo(models.User, {
    foreignKey: 'reported_by',
    as: 'reporter'
  });

  UserReport.belongsTo(models.User, {
    foreignKey: 'reviewed_by',
    as: 'reviewer'
  });

  UserReport.belongsTo(models.Listing, {
    foreignKey: 'related_listing_id',
    as: 'relatedListing'
  });

  UserReport.belongsTo(models.ChatRoom, {
    foreignKey: 'related_chat_room_id',
    as: 'relatedChatRoom'
  });
};

export default UserReport;
