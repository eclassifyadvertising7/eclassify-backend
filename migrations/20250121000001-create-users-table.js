export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    country_code: {
      type: Sequelize.STRING(5),
      allowNull: false,
      defaultValue: '+91'
    },
    mobile: {
      type: Sequelize.STRING(15),
      allowNull: false,
      unique: true
    },
    full_name: {
      type: Sequelize.STRING(150),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(150),
      allowNull: true,
      unique: true
    },
    password_hash: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    status: {
      type: Sequelize.ENUM('active', 'blocked', 'suspended', 'deleted'),
      allowNull: false,
      defaultValue: 'active'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_password_reset: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_phone_verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_email_verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    phone_verified_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    email_verified_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    last_login_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    kyc_status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    is_verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Platform verified badge - manually set by admin'
    },
    profile_photo: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    subscription_type: {
      type: Sequelize.ENUM('free', 'paid'),
      allowNull: false,
      defaultValue: 'free'
    },
    subscription_expires_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    max_devices: {
      type: Sequelize.SMALLINT,
      allowNull: false,
      defaultValue: 1
    },
    is_auto_approve_enabled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'If true, user listings are auto-approved without admin review'
    },
    total_listings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of listings created by user'
    },
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

  // Create indexes
  await queryInterface.addIndex('users', ['mobile'], {
    name: 'idx_users_mobile'
  });

  await queryInterface.addIndex('users', ['email'], {
    name: 'idx_users_email'
  });

  await queryInterface.addIndex('users', ['role_id'], {
    name: 'idx_users_role_id'
  });

  await queryInterface.addIndex('users', ['status'], {
    name: 'idx_users_status'
  });

  await queryInterface.addIndex('users', ['deleted_at'], {
    name: 'idx_users_deleted_at'
  });

  await queryInterface.addIndex('users', ['is_auto_approve_enabled'], {
    name: 'idx_users_auto_approve',
    where: {
      is_auto_approve_enabled: true
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('users');
}
