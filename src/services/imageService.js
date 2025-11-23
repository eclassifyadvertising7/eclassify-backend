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
   * @param {string} relativePath - Relative path from database
   * @returns {Promise<boolean>}
   */
  async deleteImage(relativePath) {
    try {
      if (!relativePath) return false;

      const absolutePath = path.join(process.cwd(), relativePath);
      await fs.unlink(absolutePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete image: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete multiple images
   * @param {Array<string>} relativePaths - Array of relative paths
   * @returns {Promise<Object>} - Deletion results
   */
  async deleteImages(relativePaths) {
    const results = {
      deleted: [],
      failed: []
    };

    for (const relativePath of relativePaths) {
      const success = await this.deleteImage(relativePath);
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
