/**
 * ListingMedia Service
 * Business logic for listing media management
 */

import listingMediaRepository from '#repositories/listingMediaRepository.js';
import imageService from '#services/imageService.js';
import videoService from '#services/videoService.js';
import { getFullUrl, getRelativePath } from '#utils/storageHelper.js';
import { UPLOAD_CONFIG } from '#config/uploadConfig.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class ListingMediaService {
  /**
   * Convert media data with absolute URLs
   * @param {Object} media - Media data from DB
   * @returns {Object}
   */
  _convertToAbsoluteUrls(media) {
    if (!media) return null;

    const mediaData = media.toJSON ? media.toJSON() : media;

    return {
      ...mediaData,
      mediaUrl: getFullUrl(mediaData.mediaUrl),
      thumbnailUrl: getFullUrl(mediaData.thumbnailUrl)
    };
  }

  /**
   * Convert multiple media with absolute URLs
   * @param {Array} mediaArray - Array of media
   * @returns {Array}
   */
  _convertMultipleToAbsoluteUrls(mediaArray) {
    return mediaArray.map(media => this._convertToAbsoluteUrls(media));
  }

  /**
   * Upload media for listing
   * @param {number} listingId - Listing ID
   * @param {Array} files - Uploaded files
   * @returns {Promise<Object>}
   */
  async uploadMedia(listingId, files) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadedMedia = [];
    const errors = [];

    try {
      // Separate images and videos
      const images = files.filter(f => f.mimetype.startsWith('image/'));
      const videos = files.filter(f => f.mimetype.startsWith('video/'));

      // Check image limits
      const existingImageCount = await listingMediaRepository.countByType(listingId, 'image');
      if (existingImageCount + images.length > UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles) {
        throw new Error(`Maximum ${UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles} images allowed per listing`);
      }

      // Check video limits
      const existingVideoCount = await listingMediaRepository.countByType(listingId, 'video');
      if (existingVideoCount + videos.length > UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles) {
        throw new Error(`Maximum ${UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles} videos allowed per listing`);
      }

      // Check if this is the first media (for primary flag)
      const existingTotalCount = existingImageCount + existingVideoCount;

      // Process images
      for (const file of images) {
        try {
          const relativePath = getRelativePath(file.path);

          // Process image (compress and optimize)
          await imageService.processImage(file.path, UPLOAD_CONFIG.LISTING_MEDIA.IMAGE);

          // Get next display order
          const displayOrder = await listingMediaRepository.getNextDisplayOrder(listingId);

          // Check if this should be primary (first media overall)
          const isPrimary = existingTotalCount === 0 && uploadedMedia.length === 0;

          // Create media record
          const media = await listingMediaRepository.create({
            listingId,
            mediaType: 'image',
            mediaUrl: relativePath,
            thumbnailUrl: relativePath, // Same as mediaUrl for images
            fileSizeBytes: file.size,
            width: null,
            height: null,
            durationSeconds: null,
            displayOrder,
            isPrimary,
            storageType: process.env.STORAGE_TYPE || 'local'
          });

          uploadedMedia.push(media);
        } catch (error) {
          errors.push({ file: file.originalname, error: error.message });
        }
      }

      // Process videos
      for (const file of videos) {
        try {
          const relativePath = getRelativePath(file.path);

          // Get next display order
          const displayOrder = await listingMediaRepository.getNextDisplayOrder(listingId);

          // Check if this should be primary (first media overall)
          const isPrimary = existingTotalCount === 0 && uploadedMedia.length === 0;

          // Create media record
          const media = await listingMediaRepository.create({
            listingId,
            mediaType: 'video',
            mediaUrl: relativePath,
            thumbnailUrl: null, // Will be generated later if needed
            fileSizeBytes: file.size,
            width: null,
            height: null,
            durationSeconds: null, // Will be extracted later if needed
            displayOrder,
            isPrimary,
            storageType: process.env.STORAGE_TYPE || 'local'
          });

          uploadedMedia.push(media);
        } catch (error) {
          errors.push({ file: file.originalname, error: error.message });
        }
      }

      if (uploadedMedia.length === 0) {
        throw new Error('No media was uploaded successfully');
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.MEDIA_UPLOADED,
        data: this._convertMultipleToAbsoluteUrls(uploadedMedia),
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      // Clean up uploaded files on error
      for (const file of files) {
        await imageService.deleteImage(getRelativePath(file.path));
      }
      throw error;
    }
  }

  /**
   * Get all media for a listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>}
   */
  async getByListingId(listingId) {
    const media = await listingMediaRepository.getByListingId(listingId);

    return {
      success: true,
      message: 'Media retrieved successfully',
      data: this._convertMultipleToAbsoluteUrls(media)
    };
  }

  /**
   * Set primary media
   * @param {number} listingId - Listing ID
   * @param {number} mediaId - Media ID to set as primary
   * @returns {Promise<Object>}
   */
  async setPrimary(listingId, mediaId) {
    const success = await listingMediaRepository.setPrimary(listingId, mediaId);

    if (!success) {
      throw new Error(ERROR_MESSAGES.MEDIA_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRIMARY_MEDIA_SET,
      data: null
    };
  }

  /**
   * Delete media
   * @param {number} mediaId - Media ID
   * @param {number} listingId - Listing ID (for ownership check)
   * @returns {Promise<Object>}
   */
  async delete(mediaId, listingId) {
    const media = await listingMediaRepository.getById(mediaId);

    if (!media) {
      throw new Error(ERROR_MESSAGES.MEDIA_NOT_FOUND);
    }

    // Verify media belongs to listing
    if (media.listingId !== listingId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Check if this is the only media
    const allMedia = await listingMediaRepository.getByListingId(listingId);
    if (allMedia.length === 1) {
      throw new Error('Cannot delete the only media. At least one media is required.');
    }

    // If deleting primary media, set another as primary
    if (media.isPrimary && allMedia.length > 1) {
      const nextMedia = allMedia.find(m => m.id !== mediaId);
      if (nextMedia) {
        await listingMediaRepository.setPrimary(listingId, nextMedia.id);
      }
    }

    // Delete file from storage based on media type
    if (media.mediaType === 'video') {
      await videoService.deleteVideo(media.mediaUrl);
      if (media.thumbnailUrl && media.thumbnailUrl !== media.mediaUrl) {
        await imageService.deleteImage(media.thumbnailUrl);
      }
    } else {
      await imageService.deleteImage(media.mediaUrl);
      if (media.thumbnailUrl && media.thumbnailUrl !== media.mediaUrl) {
        await imageService.deleteImage(media.thumbnailUrl);
      }
    }

    // Delete media record
    await listingMediaRepository.delete(mediaId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.MEDIA_DELETED,
      data: null
    };
  }

  /**
   * Update display order
   * @param {number} listingId - Listing ID
   * @param {Array} orderArray - Array of {id, displayOrder}
   * @returns {Promise<Object>}
   */
  async updateDisplayOrder(listingId, orderArray) {
    await listingMediaRepository.updateDisplayOrder(listingId, orderArray);

    return {
      success: true,
      message: SUCCESS_MESSAGES.MEDIA_REORDERED,
      data: null
    };
  }

  /**
   * Delete all media for a listing (used when deleting listing)
   * @param {number} listingId - Listing ID
   * @returns {Promise<void>}
   */
  async deleteAllByListingId(listingId) {
    const media = await listingMediaRepository.getByListingId(listingId);

    // Delete files from storage based on media type
    for (const m of media) {
      if (m.mediaType === 'video') {
        await videoService.deleteVideo(m.mediaUrl);
        if (m.thumbnailUrl && m.thumbnailUrl !== m.mediaUrl) {
          await imageService.deleteImage(m.thumbnailUrl);
        }
      } else {
        await imageService.deleteImage(m.mediaUrl);
        if (m.thumbnailUrl && m.thumbnailUrl !== m.mediaUrl) {
          await imageService.deleteImage(m.thumbnailUrl);
        }
      }
    }

    // Delete media records
    await listingMediaRepository.deleteByListingId(listingId);
  }
}

// Export singleton instance
export default new ListingMediaService();
