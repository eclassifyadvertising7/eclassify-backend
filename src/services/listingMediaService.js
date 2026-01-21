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
  _convertToAbsoluteUrls(media) {
    if (!media) return null;

    if (media.toJSON) {
      return media.toJSON();
    }

    return {
      ...media,
      mediaUrl: getFullUrl(media.mediaUrl, media.storageType, media.mimeType),
      thumbnailUrl: getFullUrl(media.thumbnailUrl, media.storageType, media.thumbnailMimeType)
    };
  }

  _convertMultipleToAbsoluteUrls(mediaArray) {
    return mediaArray.map(media => this._convertToAbsoluteUrls(media));
  }

  async uploadMedia(listingId, files) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadedMedia = [];
    const errors = [];

    try {
      const images = files.filter(f => f.mimetype.startsWith('image/'));
      const videos = files.filter(f => f.mimetype.startsWith('video/'));

      const existingImageCount = await listingMediaRepository.countByType(listingId, 'image');
      if (existingImageCount + images.length > UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles) {
        throw new Error(`Maximum ${UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles} images allowed per listing`);
      }

      const existingVideoCount = await listingMediaRepository.countByType(listingId, 'video');
      if (existingVideoCount + videos.length > UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles) {
        throw new Error(`Maximum ${UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles} videos allowed per listing`);
      }

      const existingTotalCount = existingImageCount + existingVideoCount;

      const listing = await listingMediaRepository.getListingById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      for (const file of images) {
        try {
          let mediaUrl, publicId, width, height;

          if (STORAGE_TYPE === 'cloudinary') {
            const optimizedBuffer = await this._optimizeImage(file, UPLOAD_CONFIG.LISTING_MEDIA.IMAGE);
            
            const folder = `uploads/listings/user-${listing.userId}`;
            const uploadResult = await uploadFile(
              { ...file, buffer: optimizedBuffer },
              `${folder}/images`,
              { resourceType: 'image' }
            );

            mediaUrl = uploadResult.publicId;
            publicId = uploadResult.publicId;
            width = uploadResult.width;
            height = uploadResult.height;
          } else {
            const relativePath = getRelativePath(file.path);
            await imageService.processImage(file.path, UPLOAD_CONFIG.LISTING_MEDIA.IMAGE);
            mediaUrl = relativePath;
            publicId = relativePath;
          }

          const displayOrder = await listingMediaRepository.getNextDisplayOrder(listingId);

          const isPrimary = existingTotalCount === 0 && uploadedMedia.length === 0;

          const media = await listingMediaRepository.create({
            listingId,
            mediaType: 'image',
            mediaUrl,
            thumbnailUrl: mediaUrl,
            mimeType: file.mimetype,
            thumbnailMimeType: file.mimetype,
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

      for (const file of videos) {
        try {
          let mediaUrl, publicId;

          if (STORAGE_TYPE === 'cloudinary') {
            const folder = `uploads/listings/user-${listing.userId}`;
            const uploadResult = await uploadFile(
              file,
              `${folder}/videos`,
              { resourceType: 'video' }
            );

            mediaUrl = uploadResult.publicId;
            publicId = uploadResult.publicId;
          } else {
            const relativePath = getRelativePath(file.path);
            mediaUrl = relativePath;
            publicId = relativePath;
          }

          const displayOrder = await listingMediaRepository.getNextDisplayOrder(listingId);

          const isPrimary = existingTotalCount === 0 && uploadedMedia.length === 0;

          const media = await listingMediaRepository.create({
            listingId,
            mediaType: 'video',
            mediaUrl,
            thumbnailUrl: mediaUrl,
            mimeType: file.mimetype,
            thumbnailMimeType: 'image/jpeg',
            fileSizeBytes: file.size,
            width: null,
            height: null,
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

  async getByListingId(listingId) {
    const media = await listingMediaRepository.getByListingId(listingId);

    return {
      success: true,
      message: 'Media retrieved successfully',
      data: this._convertMultipleToAbsoluteUrls(media)
    };
  }

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

  async delete(mediaId, listingId) {
    const media = await listingMediaRepository.getById(mediaId);

    if (!media) {
      throw new Error(ERROR_MESSAGES.MEDIA_NOT_FOUND);
    }

    if (media.listingId !== listingId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    const allMedia = await listingMediaRepository.getByListingId(listingId);
    if (allMedia.length === 1) {
      throw new Error('Cannot delete the only media. At least one media is required.');
    }

    if (media.isPrimary && allMedia.length > 1) {
      const nextMedia = allMedia.find(m => m.id !== mediaId);
      if (nextMedia) {
        await listingMediaRepository.setPrimary(listingId, nextMedia.id);
      }
    }

    const resourceType = media.mediaType === 'video' ? 'video' : 'image';
    await deleteFile(media.mediaUrl, media.storageType, { 
      resourceType,
      mimeType: media.mimeType 
    });

    if (media.thumbnailUrl && media.thumbnailUrl !== media.mediaUrl) {
      await deleteFile(media.thumbnailUrl, media.storageType, { 
        resourceType: 'image',
        mimeType: media.thumbnailMimeType 
      });
    }

    await listingMediaRepository.delete(mediaId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.MEDIA_DELETED,
      data: null
    };
  }

  async updateDisplayOrder(listingId, orderArray) {
    await listingMediaRepository.updateDisplayOrder(listingId, orderArray);

    return {
      success: true,
      message: SUCCESS_MESSAGES.MEDIA_REORDERED,
      data: null
    };
  }

  async deleteAllByListingId(listingId) {
    const media = await listingMediaRepository.getByListingId(listingId);

    let deletedCount = 0;
    let failedCount = 0;

    for (const m of media) {
      try {
        const resourceType = m.mediaType === 'video' ? 'video' : 'image';
        
        await deleteFile(m.mediaUrl, m.storageType, { 
          resourceType,
          mimeType: m.mimeType 
        });

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
      }
    }

    await listingMediaRepository.deleteByListingId(listingId);

    return {
      success: true,
      deletedCount,
      failedCount,
      totalMedia: media.length
    };
  }
}

export default new ListingMediaService();
