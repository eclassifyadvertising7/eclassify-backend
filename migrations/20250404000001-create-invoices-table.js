export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('invoices', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    
    // Invoice Identification
    invoice_number: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Year-wise Auto-generated: INV-2025-00001'
    },
    
    // Invoice Type
    invoice_type: {
      type: Sequelize.ENUM('new_subscription', 'renewal', 'upgrade', 'downgrade', 'adjustment', 'admin_assigned'),
      allowNull: false,
      defaultValue: 'new_subscription'
    },
    
    // References
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
    
    // Invoice Dates
    invoice_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    
    // Customer Information Snapshot
    customer_name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    customer_mobile: {
      type: Sequelize.STRING(20),
      allowNull: false
    },
    customer_metadata: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Address, GSTIN, PAN, etc.'
    },
    
    // Plan Details Snapshot
    plan_name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    plan_code: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    plan_version: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    plan_snapshot: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Complete plan details snapshot'
    },
    
    // Amount Breakdown
    subtotal: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Base amount before discount and tax'
    },
    
    // Discount/Coupon
    discount_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    discount_percentage: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    },
    discount_code: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    
    // Proration/Adjustment
    proration_credit: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Previous plan unused amount with GST'
    },
    proration_source_subscription_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'user_subscriptions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    proration_details: {
      type: Sequelize.JSON,
      allowNull: true
    },
    
    // Adjusted Amount (after discount + proration, before tax)
    adjusted_subtotal: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Subtotal after discount and proration (before tax)'
    },
    
    // Tax
    tax_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    tax_percentage: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    tax_breakdown: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '{cgst: 9, sgst: 9}'
    },
    
    // Final Amounts
    total_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: 'adjusted_subtotal + tax_amount'
    },
    amount_paid: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    amount_due: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: 'INR'
    },
    
    // Invoice Status
    status: {
      type: Sequelize.ENUM(
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
    payment_method: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    payment_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    
    // Additional Information
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Internal notes'
    },
    customer_notes: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes visible to customer'
    },
    terms_and_conditions: {
      type: Sequelize.TEXT,
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
  await queryInterface.addIndex('invoices', ['invoice_number'], {
    name: 'idx_invoices_invoice_number',
    unique: true
  });

  await queryInterface.addIndex('invoices', ['user_id'], {
    name: 'idx_invoices_user_id'
  });

  await queryInterface.addIndex('invoices', ['subscription_id'], {
    name: 'idx_invoices_subscription_id'
  });

  await queryInterface.addIndex('invoices', ['status'], {
    name: 'idx_invoices_status'
  });

  await queryInterface.addIndex('invoices', ['deleted_at'], {
    name: 'idx_invoices_deleted_at'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('invoices');
}
