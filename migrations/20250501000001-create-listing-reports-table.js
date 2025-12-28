import Sequelize from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('listing_reports', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      listing_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reported_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      report_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Values: spam, fraud, offensive, duplicate, wrong_category, misleading, sold, other'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Values: pending, under_review, resolved, dismissed'
      },
      reviewed_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      action_taken: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Values: none, listing_removed, listing_edited, user_warned, user_suspended, false_report'
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
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('listing_reports', {
      fields: ['listing_id', 'reported_by'],
      type: 'unique',
      name: 'unique_user_listing_report'
    });

    // Add indexes
    await queryInterface.addIndex('listing_reports', ['listing_id'], {
      name: 'idx_listing_reports_listing'
    });

    await queryInterface.addIndex('listing_reports', ['status'], {
      name: 'idx_listing_reports_status'
    });

    await queryInterface.addIndex('listing_reports', ['reported_by'], {
      name: 'idx_listing_reports_reported_by'
    });

    await queryInterface.addIndex('listing_reports', ['report_type'], {
      name: 'idx_listing_reports_type'
    });

    await queryInterface.addIndex('listing_reports', ['created_at'], {
      name: 'idx_listing_reports_created',
      order: [['created_at', 'DESC']]
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('listing_reports');
  }
};
