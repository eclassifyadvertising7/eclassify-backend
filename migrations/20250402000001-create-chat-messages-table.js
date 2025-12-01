/**
 * Migration: Create chat_messages table
 * High-volume table for storing all chat messages
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('chat_messages', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    chat_room_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sender_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    message_text: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    message_type: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Types: text, image, location, system'
    },
    message_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Location: {lat, lng, address}, System: {action, data}'
    },
    media_url: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Relative path for image messages (without extension)'
    },
    thumbnail_url: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Thumbnail path for image messages'
    },
    mime_type: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'MIME type for image messages'
    },
    thumbnail_mime_type: {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: 'image/jpeg',
      comment: 'MIME type of thumbnail (always JPEG)'
    },
    file_size_bytes: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'File size for image messages'
    },
    width: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Image width'
    },
    height: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Image height'
    },
    storage_type: {
      type: Sequelize.ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
      allowNull: true,
      comment: 'Storage type for image messages'
    },
    reply_to_message_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'chat_messages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    system_event_type: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Types: offer_made, offer_accepted, offer_rejected, contact_requested, contact_shared, user_blocked'
    },
    is_read: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    edited_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    deleted_at: {
      type: Sequelize.DATE,
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

  // Add indexes
  await queryInterface.addIndex('chat_messages', ['chat_room_id', 'created_at'], {
    name: 'idx_chat_messages_room',
    order: [['created_at', 'DESC']]
  });

  await queryInterface.addIndex('chat_messages', ['sender_id'], {
    name: 'idx_chat_messages_sender'
  });

  await queryInterface.addIndex('chat_messages', ['reply_to_message_id'], {
    name: 'idx_chat_messages_reply'
  });

  await queryInterface.addIndex('chat_messages', ['chat_room_id', 'is_read'], {
    name: 'idx_chat_messages_unread'
  });

  await queryInterface.addIndex('chat_messages', ['deleted_at'], {
    name: 'idx_chat_messages_deleted'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('chat_messages');
}
