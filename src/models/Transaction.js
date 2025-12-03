import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      
      // Transaction Identification
      transactionNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'transaction_number'
      },
      
      // Transaction Type & Context
      transactionType: {
        type: DataTypes.ENUM('payment', 'refund', 'adjustment'),
        allowNull: false,
        defaultValue: 'payment',
        field: 'transaction_type'
      },
      transactionContext: {
        type: DataTypes.ENUM('new_subscription', 'renewal', 'upgrade', 'downgrade', 'refund', 'adjustment', 'admin_assigned'),
        allowNull: false,
        defaultValue: 'new_subscription',
        field: 'transaction_context'
      },
      transactionMethod: {
        type: DataTypes.ENUM('online', 'manual', 'automated'),
        allowNull: false,
        field: 'transaction_method'
      },
      
      // References
      invoiceId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'invoice_id'
      },
      subscriptionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'subscription_id'
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id'
      },
      subscriptionPlanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subscription_plan_id'
      },
      
      // Amount Details
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'INR'
      },
      
      // Proration Tracking
      hasProration: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'has_proration'
      },
      prorationAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'proration_amount'
      },
      
      // Payment Gateway Details
      paymentGateway: {
        type: DataTypes.ENUM('manual', 'razorpay', 'stripe', 'paytm', 'phonepe', 'cashfree', 'payU', 'jiopay', 'instamojo', 'airpay'),
        allowNull: false,
        field: 'payment_gateway'
      },
      gatewayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'gateway_order_id'
      },
      gatewayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'gateway_payment_id'
      },
      gatewaySignature: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'gateway_signature'
      },
      gatewayResponse: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'gateway_response'
      },
      
      // Manual Payment Fields
      manualPaymentMetadata: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'manual_payment_metadata'
      },
      
      // Transaction Status
      status: {
        type: DataTypes.ENUM(
          'initiated',
          'pending',
          'processing',
          'completed',
          'failed',
          'refunded',
          'partially_refunded',
          'cancelled',
          'expired'
        ),
        allowNull: false,
        defaultValue: 'initiated'
      },
      failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'failure_reason'
      },
      failureCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'failure_code'
      },
      
      // Manual Verification
      verifiedBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'verified_by'
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verified_at'
      },
      verificationNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'verification_notes'
      },
      
      // Request Tracking
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
      deviceInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'device_info'
      },
      
      // Timestamps
      initiatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'initiated_at'
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at'
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at'
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
      tableName: 'transactions',
      underscored: true,
      paranoid: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  );

  Transaction.associate = (models) => {
    // Belongs to Invoice
    Transaction.belongsTo(models.Invoice, {
      foreignKey: 'invoice_id',
      as: 'invoice'
    });

    // Belongs to UserSubscription
    Transaction.belongsTo(models.UserSubscription, {
      foreignKey: 'subscription_id',
      as: 'subscription'
    });

    // Belongs to User
    Transaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Belongs to SubscriptionPlan
    Transaction.belongsTo(models.SubscriptionPlan, {
      foreignKey: 'subscription_plan_id',
      as: 'plan'
    });

    // Verified by User
    Transaction.belongsTo(models.User, {
      foreignKey: 'verified_by',
      as: 'verifier'
    });
  };

  return Transaction;
};
