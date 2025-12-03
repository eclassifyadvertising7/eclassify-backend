/**
 * Migration: Create other_media table
 * Table for storing images and videos
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("other_media", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    identifier_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    identifier_slug: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    slug: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    caption: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Short caption for the media",
    },
    sub_caption: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Additional subtitle or context",
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Detailed description of the media",
    },
    media_type: {
      type: Sequelize.ENUM("image", "video"),
      allowNull: false,
      defaultValue: "image",
    },
    media_url: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: "Media URL",
    },
    thumbnail_url: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: "Thumbnail for videos",
    },
    mime_type: {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: "image/jpeg",
      comment: "MIME type of main media file",
    },
    thumbnail_mime_type: {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: "image/jpeg",
      comment: "MIME type of thumbnail file",
    },
    display_order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_primary: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    storage_type: {
      type: Sequelize.ENUM(
        "local",
        "cloudinary",
        "aws",
        "gcs",
        "digital_ocean"
      ),
      allowNull: false,
      defaultValue: "local",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  // Add indexes for common queries
  await queryInterface.addIndex("other_media", ["identifier_id", "identifier_slug"], {
    name: "idx_other_media_identifier",
  });

  await queryInterface.addIndex("other_media", ["slug"], {
    name: "idx_other_media_slug",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("other_media");
}
