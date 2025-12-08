/**
 * ListingMedia Service
 * Business logic for listing media management
 * Supports both local and Cloudinary storage
 */

import listingMediaRepository from '#repositories/listingMediaRepository.js';
import imageService from '#services/imageService.js';
import videoService from '#services/videoService.js';
import { uploadFile, deleteFile } from '#config/storageConfig.js';
import { getFullUrl, getRelativePath } from '#utils/storageHelper.js';
import { UPLOAD_CONFIG } from '#config/uploadConfig.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import sharp from 'sharp';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

class ListingMediaService {
  /**
   * Convert media data with absolute URLs
   * @param {Object} media - Media data from DB
   * @returns {Object}
   */
  _convertToAbsoluteUrls(media) {
    if (!media) return null;

    // Use model instance directly - getters will handle URL generation
    if (media.toJSON) {
      return media.toJSON();
    }

    // If already plain object, generate URLs manually
    return {
      ...media,
      mediaUrl: getFullUrl(media.mediaUrl, media.storageType, media.mimeType),
      thumbnailUrl: getFullUrl(media.thumbnailUrl, media.storageType, media.thumbnailMimeType)
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

      // Get listing info for folder structure
      const listing = await listingMediaRepository.getListingById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      // Process images
      for (const file of images) {
        try {
          let mediaUrl, publicId, width, height;

          if (STORAGE_TYPE === 'cloudinary') {
            // Optimize image before upload
            const optimizedBuffer = await this._optimizeImage(file, UPLOAD_CONFIG.LISTING_MEDIA.IMAGE);
            
            // Upload to Cloudinary
            const folder = `uploads/listings/user-${listing.userId}`;
            const uploadResult = await uploadFile(
              { ...file, buffer: optimizedBuffer },
              `${folder}/images`,
              { resourceType: 'image' }
            );

            mediaUrl = uploadResult.publicId; // Store publicId for Cloudinary
            publicId = uploadResult.publicId;
            width = uploadResult.width;
            height = uploadResult.height;
          } else {
            // Local storage
            const relativePath = getRelativePath(file.path);
            await imageService.processImage(file.path, UPLOAD_CONFIG.LISTING_MEDIA.IMAGE);
            mediaUrl = relativePath;
            publicId = relativePath;
          }

          // Get next display order
          const displayOrder = await listingMediaRepository.getNextDisplayOrder(listingId);

          // Check if this should be primary (first media overall)
          const isPrimary = existingTotalCount === 0 && uploadedMedia.length === 0;

          // Create media record
          const media = await listingMediaRepository.create({
            listingId,
            mediaType: 'image',
            mediaUrl,
            thumbnailUrl: mediaUrl, // Same as mediaUrl for images
            mimeType: file.mimetype, // Store MIME type
            thumbnailMimeType: file.mimetype, // Same for thumbnail
            fileSizeBytes: file.size,
            width,
            height,
            durationSeconds: null,
            displayOrder,
            isPrimary,
            storageType: STORAGE_TYPE
          });

          uploadedMedia.push(media);
        } catch (error) {
          errors.push({ file: file.originalname, error: error.message });
        }
      }

      // Process videos
      for (const file of videos) {
        try {
          let mediaUrl, publicId;

          if (STORAGE_TYPE === 'cloudinary') {
            // Upload to Cloudinary
            const folder = `uploads/listings/user-${listing.userId}`;
            const uploadResult = await uploadFile(
              file,
              `${folder}/videos`,
              { resourceType: 'video' }
            );

            mediaUrl = uploadResult.publicId; // Store publicId for Cloudinary
            publicId = uploadResult.publicId;
          } else {
            // Local storage
            const relativePath = getRelativePath(file.path);
            mediaUrl = relativePath;
            publicId = relativePath;
          }

          // Get next display order
          const displayOrder = await listingMediaRepository.getNextDisplayOrder(listingId);

          // Check if this should be primary (first media overall)
          const isPrimary = existingTotalCount === 0 && uploadedMedia.length === 0;

          // Create media record
          const media = await listingMediaRepository.create({
            listingId,
            mediaType: 'video',
            mediaUrl,
            thumbnailUrl: mediaUrl, // Same path, different format for Cloudinary
            mimeType: file.mimetype, // Store video MIME type
            thumbnailMimeType: 'image/jpeg', // Thumbnails are always JPEG
            fileSizeBytes: file.size,
            width: null,
            height: null,
            durationSeconds: null, // Will be extracted later if needed
            displayOrder,
            isPrimary,
            storageType: STORAGE_TYPE
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
      if (STORAGE_TYPE === 'local') {
        for (const file of files) {
          if (file.path) {
            await imageService.deleteImage(getRelativePath(file.path), file.mimetype);
          }
        }
      }
      throw error;
    }
  }

  /**
   * Optimize image using Sharp
   * @param {Object} file - Multer file object
   * @param {Object} config - Upload config
   * @returns {Promise<Buffer>}
   */
  async _optimizeImage(file, config) {
    try {
      const imageBuffer = file.buffer || (await sharp(file.path).toBuffer());
      
      return await sharp(imageBuffer)
        .resize(config.maxWidth, config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: config.quality })
        .toBuffer();
    } catch (error) {
      console.error('Image optimization error:', error);
      return file.buffer || imageBuffer;
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

    // Delete file from storage
    const resourceType = media.mediaType === 'video' ? 'video' : 'image';
    await deleteFile(media.mediaUrl, media.storageType, { 
      resourceType,
      mimeType: media.mimeType 
    });

    // Delete thumbnail if different from main media
    if (media.thumbnailUrl && media.thumbnailUrl !== media.mediaUrl) {
      await deleteFile(media.thumbnailUrl, media.storageType, { 
        resourceType: 'image',
        mimeType: media.thumbnailMimeType 
      });
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
   * CRITICAL: Deletes physical files BEFORE database records
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>}
   */
  async deleteAllByListingId(listingId) {
    const media = await listingMediaRepository.getByListingId(listingId);

    let deletedCount = 0;
    let failedCount = 0;

    // Delete physical files from storage FIRST
    for (const m of media) {
      try {
        const resourceType = m.mediaType === 'video' ? 'video' : 'image';
        
        // Delete main media file
        await deleteFile(m.mediaUrl, m.storageType, { 
          resourceType,
          mimeType: m.mimeType 
        });

        // Delete thumbnail if different from main media
        if (m.thumbnailUrl && m.thumbnailUrl !== m.mediaUrl) {
          await deleteFile(m.thumbnailUrl, m.storageType, { 
            resourceType: 'image',
            mimeType: m.thumbnailMimeType 
          });
        }

        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete media file ${m.id}: ${error.message}`);
        failedCount++;
        // Continue with other files even if one fails
      }
    }

    // Delete database records AFTER physical files
    await listingMediaRepository.deleteByListingId(listingId);

    return {
      success: true,
      deletedCount,
      failedCount,
      totalMedia: media.length
    };
  }
}

// Export singleton instance
export default new ListingMediaService();
