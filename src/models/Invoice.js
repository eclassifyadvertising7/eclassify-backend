import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      
      // Invoice Identification
      invoiceNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'invoice_number'
      },
      
      // Invoice Type
      invoiceType: {
        type: DataTypes.ENUM('new_subscription', 'renewal', 'upgrade', 'downgrade', 'adjustment', 'admin_assigned'),
        allowNull: false,
        defaultValue: 'new_subscription',
        field: 'invoice_type'
      },
      
      // References
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id'
      },
      subscriptionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'subscription_id'
      },
      
      // Invoice Dates
      invoiceDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'invoice_date'
      },
      
      // Customer Information Snapshot
      customerName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'customer_name'
      },
      customerMobile: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'customer_mobile'
      },
      customerMetadata: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'customer_metadata'
      },
      
      // Plan Details Snapshot
      planName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'plan_name'
      },
      planCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'plan_code'
      },
      planVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'plan_version'
      },
      planSnapshot: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'plan_snapshot'
      },
      
      // Amount Breakdown
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      
      // Discount/Coupon
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'discount_amount'
      },
      discountPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'discount_percentage'
      },
      discountCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'discount_code'
      },
      
      // Proration/Adjustment
      prorationCredit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'proration_credit'
      },
      prorationSourceSubscriptionId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'proration_source_subscription_id'
      },
      prorationDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'proration_details'
      },
      
      // Adjusted Amount
      adjustedSubtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'adjusted_subtotal'
      },
      
      // Tax
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'tax_amount'
      },
      taxPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'tax_percentage'
      },
      taxBreakdown: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'tax_breakdown'
      },
      
      // Final Amounts
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_amount'
      },
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'amount_paid'
      },
      amountDue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'amount_due'
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'INR'
      },
      
      // Invoice Status
      status: {
        type: DataTypes.ENUM(
          'draft',
          'issued',
          'pending',
          'paid',
          'partially_paid',
          'overdue',
          'cancelled',
          'refunded',
          'void'
        ),
        allowNull: false,
        defaultValue: 'issued'
      },
      
      // Payment Tracking
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method'
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'payment_date'
      },
      
      // Additional Information
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      customerNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'customer_notes'
      },
      termsAndConditions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'terms_and_conditions'
      },
      
      // Metadata
      metadata: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
      },
      
      // Audit Fields
      createdBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'created_by'
      },
      updatedBy: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'updated_by'
      },
      deletedBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'deleted_by'
      }
    },
    {
      tableName: 'invoices',
      underscored: true,
      paranoid: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  );

  Invoice.associate = (models) => {
    // Belongs to User
    Invoice.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Belongs to UserSubscription
    Invoice.belongsTo(models.UserSubscription, {
      foreignKey: 'subscription_id',
      as: 'subscription'
    });

    // Has many Transactions
    Invoice.hasMany(models.Transaction, {
      foreignKey: 'invoice_id',
      as: 'transactions'
    });
  };

  return Invoice;
};
