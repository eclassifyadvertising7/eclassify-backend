export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_profiles', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    dob: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    gender: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    about: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    name_on_id: {
      type: Sequelize.STRING(150),
      allowNull: true
    },
    business_name: {
      type: Sequelize.STRING(200),
      allowNull: true
    },
    gstin: {
      type: Sequelize.STRING(15),
      allowNull: true
    },
    aadhar_number: {
      type: Sequelize.STRING(12),
      allowNull: true
    },
    pan_number: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    address_line1: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    address_line2: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    city_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    city_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    state_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    state_name: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    country: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'India'
    },
    pincode: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    },
    profile_photo: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    profile_photo_storage_type: {
      type: Sequelize.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
      allowNull: true
    },
    profile_photo_mime_type: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    preferred_state_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    preferred_state_name: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    preferred_city_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    preferred_city_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    preferred_latitude: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    },
    preferred_longitude: {
      type: Sequelize.DECIMAL(11, 8),
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
  await queryInterface.addIndex('user_profiles', ['user_id'], {
    name: 'idx_user_profiles_user_id',
    unique: true
  });

  await queryInterface.addIndex('user_profiles', ['city_id'], {
    name: 'idx_user_profiles_city_id'
  });

  await queryInterface.addIndex('user_profiles', ['state_id'], {
    name: 'idx_user_profiles_state_id'
  });

  await queryInterface.addIndex('user_profiles', ['preferred_state_id'], {
    name: 'idx_user_profiles_preferred_state_id'
  });

  await queryInterface.addIndex('user_profiles', ['preferred_city_id'], {
    name: 'idx_user_profiles_preferred_city_id'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('user_profiles');
}
