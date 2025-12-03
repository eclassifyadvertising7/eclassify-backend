export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('transactions', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    
    // Transaction Identification
    transaction_number: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Auto-generated: TXN-2025-00001'
    },
    
    // Transaction Type & Context
    transaction_type: {
      type: Sequelize.ENUM('payment', 'refund', 'adjustment'),
      allowNull: false,
      defaultValue: 'payment'
    },
    transaction_context: {
      type: Sequelize.ENUM('new_subscription', 'renewal', 'upgrade', 'downgrade', 'refund', 'adjustment', 'admin_assigned'),
      allowNull: false,
      defaultValue: 'new_subscription'
    },
    transaction_method: {
      type: Sequelize.ENUM('online', 'manual', 'automated'),
      allowNull: false
    },
    
    // References
    invoice_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    subscription_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'user_subscriptions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    subscription_plan_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    
    // Amount Details
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: 'INR'
    },
    
    // Proration Tracking
    has_proration: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    proration_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    
    // Payment Gateway Details
    payment_gateway: {
      type: Sequelize.ENUM('manual', 'razorpay', 'stripe', 'paytm', 'phonepe', 'cashfree', 'payU', 'jiopay', 'instamojo', 'airpay'),
      allowNull: false
    },
    gateway_order_id: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    gateway_payment_id: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    gateway_signature: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    gateway_response: {
      type: Sequelize.JSON,
      allowNull: true
    },
    
    // Manual Payment Fields
    manual_payment_metadata: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Manual payment details: payer name, UPI ID, transaction ID, proof, etc.'
    },
    
    // Transaction Status
    status: {
      type: Sequelize.ENUM(
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
    failure_reason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    failure_code: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    
    // Manual Verification
    verified_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    verified_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    verification_notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    
    // Request Tracking
    ip_address: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    device_info: {
      type: Sequelize.JSON,
      allowNull: true
    },
    
    // Timestamps
    initiated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    completed_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    
    // Metadata
    metadata: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    },
    
    // Audit Fields
    created_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    updated_by: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of update history: [{userId, userName, timestamp}]'
    },
    deleted_by: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Indexes
  await queryInterface.addIndex('transactions', ['transaction_number'], {
    name: 'idx_transactions_transaction_number',
    unique: true
  });

  await queryInterface.addIndex('transactions', ['invoice_id'], {
    name: 'idx_transactions_invoice_id'
  });

  await queryInterface.addIndex('transactions', ['subscription_id'], {
    name: 'idx_transactions_subscription_id'
  });

  await queryInterface.addIndex('transactions', ['user_id'], {
    name: 'idx_transactions_user_id'
  });

  await queryInterface.addIndex('transactions', ['status'], {
    name: 'idx_transactions_status'
  });

  await queryInterface.addIndex('transactions', ['deleted_at'], {
    name: 'idx_transactions_deleted_at'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('transactions');
}
