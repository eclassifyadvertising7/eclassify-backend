/**
 * Image Service
 * Handles image processing, compression, and deletion
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

class ImageService {
  /**
   * Process and optimize image
   * @param {string} filePath - Absolute path to uploaded file
   * @param {Object} config - Processing configuration
   * @returns {Promise<Object>} - Processed image info
   */
  async processImage(filePath, config) {
    try {
      const { maxWidth, maxHeight, quality } = config;

      // Get image metadata
      const metadata = await sharp(filePath).metadata();

      // Resize if needed
      let pipeline = sharp(filePath);

      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Compress and save
      await pipeline
        .jpeg({ quality, mozjpeg: true })
        .toFile(filePath + '.tmp');

      // Replace original with compressed version
      await fs.unlink(filePath);
      await fs.rename(filePath + '.tmp', filePath);

      // Get final metadata
      const finalMetadata = await sharp(filePath).metadata();

      return {
        width: finalMetadata.width,
        height: finalMetadata.height,
        size: finalMetadata.size,
        format: finalMetadata.format
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  /**
   * Delete image file
   * @param {string} relativePath - Relative path from database (without extension)
   * @param {string} mimeType - MIME type to determine extension
   * @returns {Promise<boolean>}
   */
  async deleteImage(relativePath, mimeType = 'image/jpeg') {
    try {
      if (!relativePath) return false;

      // Map MIME type to extension
      const MIME_TO_EXT = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif'
      };

      const ext = MIME_TO_EXT[mimeType] || 'jpg';
      const absolutePath = path.join(process.cwd(), `${relativePath}.${ext}`);
      await fs.unlink(absolutePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete image: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete multiple images
   * @param {Array<Object>} images - Array of {path, mimeType}
   * @returns {Promise<Object>} - Deletion results
   */
  async deleteImages(images) {
    const results = {
      deleted: [],
      failed: []
    };

    for (const image of images) {
      const relativePath = typeof image === 'string' ? image : image.path;
      const mimeType = typeof image === 'object' ? image.mimeType : 'image/jpeg';
      
      const success = await this.deleteImage(relativePath, mimeType);
      if (success) {
        results.deleted.push(relativePath);
      } else {
        results.failed.push(relativePath);
      }
    }

    return results;
  }
}

// Export singleton instance
export default new ImageService();
