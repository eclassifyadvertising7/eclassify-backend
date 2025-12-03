/**
 * OtherMedia Model
 * Images and videos for various entities (manual payments, etc.)
 */

import { DataTypes } from "sequelize";
import sequelize from "#config/database.js";
import { getFullUrl } from "#utils/storageHelper.js";

const OtherMedia = sequelize.define(
  "OtherMedia",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    identifierId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "identifier_id",
    },
    identifierSlug: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "identifier_slug",
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subCaption: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "sub_caption",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mediaType: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: false,
      defaultValue: "image",
      field: "media_type",
    },
    mediaUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "media_url",
      get() {
        const rawValue = this.getDataValue("mediaUrl");
        const storageType = this.getDataValue("storageType");
        const mimeType = this.getDataValue("mimeType");
        return getFullUrl(rawValue, storageType, mimeType);
      },
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "thumbnail_url",
      get() {
        const rawValue = this.getDataValue("thumbnailUrl");
        const storageType = this.getDataValue("storageType");
        const mimeType = this.getDataValue("thumbnailMimeType");
        return getFullUrl(rawValue, storageType, mimeType);
      },
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "mime_type",
      defaultValue: "image/jpeg",
      comment: "MIME type of main media file",
    },
    thumbnailMimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "thumbnail_mime_type",
      defaultValue: "image/jpeg",
      comment: "MIME type of thumbnail file",
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "display_order",
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_primary",
    },
    storageType: {
      type: DataTypes.ENUM("local", "cloudinary", "aws", "gcs", "digital_ocean"),
      allowNull: false,
      defaultValue: "local",
      field: "storage_type",
    },
  },
  {
    sequelize,
    tableName: "other_media",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeDestroy: async (media, options) => {
        // Delete files from storage (local/cloudinary)
        // This will be implemented in the service layer
        // Hook is here as a placeholder for future implementation
      },
    },
  }
);

// Define associations (if needed in future)
OtherMedia.associate = (models) => {
  // No associations currently needed
  // Add associations here when required
};

export default OtherMedia;
