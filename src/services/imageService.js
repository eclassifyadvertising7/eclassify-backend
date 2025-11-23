import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_CONFIG } from '#uploads/uploadConfig.js';

/**
 * Image Service
 * Handles image upload, optimization, and deletion across different storage backends
 */
class ImageService {
  /**
   * Upload and optimize profile photo
   * @param {Object} file - Multer file object
   * @param {string} userId - User ID for organizing files
   * @returns {Promise<Object>} - { url, thumbnailUrl, publicId }
   */
  async uploadProfilePhoto(file, userId) {
    const storageType = process.env.STORAGE_TYPE || 'local';

    if (storageType === 'local') {
      return await this._uploadToLocal(file, userId);
    } else if (storageType === 'cloudinary') {
      return await this._uploadToCloudinary(file, userId);
    } else if (storageType === 's3') {
      return await this._uploadToS3(file, userId);
    }

    throw new Error('Invalid storage type');
  }

  /**
   * Delete profile photo
   * @param {string} publicId - File identifier
   * @param {string} storageType - Storage type (local/cloudinary/s3)
   */
  async deleteProfilePhoto(publicId, storageType = 'local') {
    if (storageType === 'local') {
      return await this._deleteFromLocal(publicId);
    } else if (storageType === 'cloudinary') {
      return await this._deleteFromCloudinary(publicId);
    } else if (storageType === 's3') {
      return await this._deleteFromS3(publicId);
    }
  }

  /**
   * Upload to local storage
   */
  async _uploadToLocal(file, userId) {
    const { maxWidth, maxHeight, quality, thumbnailSize } = UPLOAD_CONFIG.PROFILE_PHOTO;
    const uploadDir = process.env.UPLOAD_DIR || './uploads/profiles';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    
    // Optimize main image
    const filename = `profile-${userId}-${uniqueSuffix}.webp`;
    const filepath = path.join(uploadDir, filename);
    
    await sharp(file.path || file.buffer)
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toFile(filepath);

    // Generate thumbnail
    const thumbnailFilename = `profile-${userId}-${uniqueSuffix}-thumb.webp`;
    const thumbnailPath = path.join(uploadDir, thumbnailFilename);
    
    await sharp(file.path || file.buffer)
      .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
      .webp({ quality })
      .toFile(thumbnailPath);

    // Delete original file if it was saved to disk
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    return {
      url: `${baseUrl}/uploads/profiles/${filename}`,
      thumbnailUrl: `${baseUrl}/uploads/profiles/${thumbnailFilename}`,
      publicId: filename,
      storageType: 'local'
    };
  }

  /**
   * Upload to Cloudinary (placeholder for future implementation)
   */
  async _uploadToCloudinary(file, userId) {
    // TODO: Implement Cloudinary upload
    throw new Error('Cloudinary upload not implemented yet');
  }

  /**
   * Upload to S3 (placeholder for future implementation)
   */
  async _uploadToS3(file, userId) {
    // TODO: Implement S3 upload
    throw new Error('S3 upload not implemented yet');
  }

  /**
   * Delete from local storage
   */
  async _deleteFromLocal(publicId) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads/profiles';
    const filepath = path.join(uploadDir, publicId);
    
    // Delete main image
    await fs.unlink(filepath).catch(() => {});
    
    // Delete thumbnail
    const thumbnailPath = filepath.replace('.webp', '-thumb.webp');
    await fs.unlink(thumbnailPath).catch(() => {});
  }

  /**
   * Delete from Cloudinary (placeholder)
   */
  async _deleteFromCloudinary(publicId) {
    // TODO: Implement Cloudinary deletion
  }

  /**
   * Delete from S3 (placeholder)
   */
  async _deleteFromS3(publicId) {
    // TODO: Implement S3 deletion
  }
}

export default new ImageService();
