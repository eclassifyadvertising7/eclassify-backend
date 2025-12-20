import { Sequelize } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('user_favorites', {
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create indexes for performance
    await queryInterface.addIndex('user_favorites', ['user_id'], {
      name: 'idx_user_favorites_user_id'
    });

    await queryInterface.addIndex('user_favorites', ['listing_id'], {
      name: 'idx_user_favorites_listing_id'
    });

    await queryInterface.addIndex('user_favorites', ['user_id', 'listing_id'], {
      name: 'idx_user_favorites_user_listing',
      unique: true
    });

    await queryInterface.addIndex('user_favorites', ['created_at'], {
      name: 'idx_user_favorites_created_at'
    });

    await queryInterface.addIndex('user_favorites', ['deleted_at'], {
      name: 'idx_user_favorites_deleted_at'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_favorites');
  }
};