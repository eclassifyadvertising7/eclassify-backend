import Sequelize from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('user_reports', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      reported_user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
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
        comment: 'Values: scammer, fake_profile, harassment, spam, inappropriate_behavior, fake_listings, non_responsive, other'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      context: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Where/how the issue occurred'
      },
      related_listing_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'listings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      related_chat_room_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'chat_rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
        comment: 'Values: none, warning_sent, user_suspended, user_banned, listings_removed, false_report'
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
    await queryInterface.addConstraint('user_reports', {
      fields: ['reported_user_id', 'reported_by'],
      type: 'unique',
      name: 'unique_reporter_reported_user'
    });

    // Add check constraint (users cannot report themselves)
    // await queryInterface.addConstraint('user_reports', {
    //   fields: ['reported_user_id', 'reported_by'],
    //   type: 'check',
    //   name: 'check_not_self_report',
    //   where: {
    //     [Sequelize.Op.ne]: Sequelize.literal('reported_user_id = reported_by')
    //   }
    // });

    // Add indexes
    await queryInterface.addIndex('user_reports', ['reported_user_id'], {
      name: 'idx_user_reports_reported_user'
    });

    await queryInterface.addIndex('user_reports', ['status'], {
      name: 'idx_user_reports_status'
    });

    await queryInterface.addIndex('user_reports', ['reported_by'], {
      name: 'idx_user_reports_reported_by'
    });

    await queryInterface.addIndex('user_reports', ['report_type'], {
      name: 'idx_user_reports_type'
    });

    await queryInterface.addIndex('user_reports', ['created_at'], {
      name: 'idx_user_reports_created',
      order: [['created_at', 'DESC']]
    });

    await queryInterface.addIndex('user_reports', ['related_listing_id'], {
      name: 'idx_user_reports_listing'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_reports');
  }
};
