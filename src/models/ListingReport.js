import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const ListingReport = sequelize.define('ListingReport', {
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
  tableName: 'listing_reports',
  timestamps: true,
  underscored: true,
  paranoid: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

ListingReport.associate = (models) => {
  ListingReport.belongsTo(models.Listing, {
    foreignKey: 'listing_id',
    as: 'listing'
  });

  ListingReport.belongsTo(models.User, {
    foreignKey: 'reported_by',
    as: 'reporter'
  });

  ListingReport.belongsTo(models.User, {
    foreignKey: 'reviewed_by',
    as: 'reviewer'
  });
};

export default ListingReport;
