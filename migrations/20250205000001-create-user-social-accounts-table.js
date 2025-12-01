export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_social_accounts', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    provider: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    provider_id: {
      type: Sequelize.STRING(200),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(150),
      allowNull: true
    },
    profile_picture_url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    profile_picture_storage_type: {
      type: Sequelize.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
      allowNull: true
    },
    profile_picture_mime_type: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    is_primary: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    access_token: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    refresh_token: {
      type: Sequelize.TEXT,
      allowNull: true
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

  // Create indexes
  await queryInterface.addIndex('user_social_accounts', ['user_id'], {
    name: 'idx_user_social_accounts_user_id'
  });

  await queryInterface.addIndex('user_social_accounts', ['provider', 'provider_id'], {
    name: 'unique_provider_provider_id',
    unique: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('user_social_accounts');
}
