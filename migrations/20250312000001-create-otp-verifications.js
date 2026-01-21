import { Sequelize } from 'sequelize';

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('otp_verifications', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      mobile: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: 'mobile'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'email'
      },
      country_code: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: '+91',
        field: 'country_code'
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: false,
        field: 'otp'
      },
      type: {
        type: Sequelize.ENUM('signup', 'login', 'password_reset', 'verification'),
        allowNull: false,
        field: 'type'
      },
      channel: {
        type: Sequelize.ENUM('sms', 'email', 'whatsapp', 'telegram', 'arattai', 'call'),
        allowNull: false,
        defaultValue: 'sms',
        field: 'channel'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified'
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'verified_at'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'expires_at'
      },
      attempts: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: 'attempts'
      },
      resend_count: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: 'resend_count'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        field: 'ip_address'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'user_agent'
      },
      session_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'session_id'
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

    // Add indexes for faster lookups
    await queryInterface.addIndex('otp_verifications', ['mobile', 'type', 'is_verified'], {
      name: 'idx_otp_mobile_type_verified'
    });

    await queryInterface.addIndex('otp_verifications', ['email', 'type', 'is_verified'], {
      name: 'idx_otp_email_type_verified'
    });

    await queryInterface.addIndex('otp_verifications', ['expires_at'], {
      name: 'idx_otp_expires_at'
    });

    await queryInterface.addIndex('otp_verifications', ['ip_address', 'created_at'], {
      name: 'idx_otp_ip_created'
    });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('otp_verifications');
}
