export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('locations', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    place_id: {
      type: Sequelize.STRING(200),
      allowNull: false,
      comment: 'Unique identifier from map provider'
    },
    provider: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Map provider: ola_maps, google_maps, mapbox, manual'
    },
    parent_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Parent location for hierarchical data'
    },
    name: {
      type: Sequelize.STRING(300),
      allowNull: false
    },
    type: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'locality, city, state, country, etc.'
    },
    country: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    state: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    district: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    city: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    locality: {
      type: Sequelize.STRING(200),
      allowNull: true
    },
    pincode: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: false
    },
    location: {
      type: 'geography(POINT, 4326)',
      allowNull: false
    },
    formatted_address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    types: {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Location types from provider'
    },
    address_components: {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Detailed address breakdown'
    },
    raw_response: {
      type: Sequelize.JSONB,
      allowNull: false,
      comment: 'Complete API response for reference'
    },
    matched_state_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Matched state from legacy states table'
    },
    matched_city_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Matched city from legacy cities table'
    },
    match_confidence: {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
      comment: 'Confidence score for state/city matching (0.00-1.00)'
    },
    usage_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of listings using this location'
    },
    last_used_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Last time this location was used'
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
    updated_by: {
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
    }
  });

  await queryInterface.addConstraint('locations', {
    fields: ['provider', 'place_id'],
    type: 'unique',
    name: 'uq_locations_provider_place_id'
  });

  await queryInterface.addConstraint('locations', {
    fields: ['provider'],
    type: 'check',
    name: 'check_provider',
    where: {
      provider: ['ola_maps', 'google_maps', 'mapbox', 'manual']
    }
  });

  await queryInterface.addConstraint('locations', {
    fields: ['match_confidence'],
    type: 'check',
    name: 'check_match_confidence',
    where: Sequelize.literal('match_confidence IS NULL OR (match_confidence >= 0 AND match_confidence <= 1)')
  });

  await queryInterface.addIndex('locations', ['provider', 'place_id'], {
    name: 'idx_locations_provider_place_id',
    unique: true
  });

  await queryInterface.addIndex('locations', ['parent_id'], {
    name: 'idx_locations_parent_id'
  });

  await queryInterface.addIndex('locations', ['country'], {
    name: 'idx_locations_country'
  });

  await queryInterface.addIndex('locations', ['state'], {
    name: 'idx_locations_state'
  });

  await queryInterface.addIndex('locations', ['city'], {
    name: 'idx_locations_city'
  });

  await queryInterface.addIndex('locations', ['state', 'city'], {
    name: 'idx_locations_state_city'
  });

  await queryInterface.addIndex('locations', ['type'], {
    name: 'idx_locations_type'
  });

  await queryInterface.addIndex('locations', ['provider', 'type'], {
    name: 'idx_locations_provider_type'
  });

  await queryInterface.sequelize.query(
    'CREATE INDEX idx_locations_location_gist ON locations USING GIST(location);'
  );

  await queryInterface.addIndex('locations', ['matched_state_id', 'matched_city_id'], {
    name: 'idx_locations_matched_ids'
  });

  await queryInterface.addIndex('locations', ['types'], {
    name: 'idx_locations_types',
    using: 'GIN'
  });

  await queryInterface.addIndex('locations', ['address_components'], {
    name: 'idx_locations_address_components',
    using: 'GIN'
  });

  await queryInterface.addIndex('locations', ['usage_count'], {
    name: 'idx_locations_usage_count'
  });

  await queryInterface.addIndex('locations', ['last_used_at'], {
    name: 'idx_locations_last_used'
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('locations');
}
