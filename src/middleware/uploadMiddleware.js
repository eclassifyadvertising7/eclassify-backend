/**
 * Upload Middleware
 * Handles file uploads using Multer with validation
 * Supports both local storage and Cloudinary
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { generateFileName } from '#utils/customSlugify.js';
import { UPLOAD_CONFIG } from '#config/uploadConfig.js';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

/**
 * Ensure directory exists, create if not
 * @param {string} dirPath - Directory path
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Create Multer storage configuration
 * Uses memory storage for Cloudinary, disk storage for local
 * @param {string} uploadType - Type of upload (categories, profiles, listings, chats)
 * @param {string} subFolder - Optional subfolder (for listings: images/videos, for chats: images)
 */
const createStorage = (uploadType, subFolder = null) => {
  // Use memory storage for Cloudinary (files will be uploaded from buffer)
  if (STORAGE_TYPE === 'cloudinary') {
    return multer.memoryStorage();
  }

  // Use disk storage for local uploads
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        let uploadPath;

        if (uploadType === 'listings' && req.user?.userId) {
          // For listings: uploads/listings/user-{userId}/{images|videos}
          const mediaType = subFolder || 'images';
          uploadPath = path.join(
            process.cwd(),
            'uploads',
            'listings',
            `user-${req.user.userId}`,
            mediaType
          );
        } else if (uploadType === 'chats' && req.params?.roomId) {
          // For chats: uploads/chats/room-{roomId}/images
          const mediaType = subFolder || 'images';
          uploadPath = path.join(
            process.cwd(),
            'uploads',
            'chats',
            `room-${req.params.roomId}`,
            mediaType
          );
        } else {
          // For other types: uploads/{type}/{year}/{month}
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          uploadPath = path.join(process.cwd(), 'uploads', uploadType, String(year), month);
        }

        await ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
      } catch (error) {
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      try {
        const uniqueName = generateFileName(file.originalname);
        cb(null, uniqueName);
      } catch (error) {
        cb(error, null);
      }
    }
  });
};

/**
 * File filter for validation
 * @param {Array} allowedTypes - Allowed MIME types
 */
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

/**
 * Category images upload middleware (icon + image)
 */
export const uploadCategoryImages = multer({
  storage: createStorage('categories'),
  limits: {
    fileSize: UPLOAD_CONFIG.CATEGORY_IMAGE.maxSize
  },
  fileFilter: createFileFilter(UPLOAD_CONFIG.CATEGORY_IMAGE.allowedTypes)
}).fields([
  { name: 'icon', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

/**
 * Profile photo upload middleware
 */
export const uploadProfilePhoto = multer({
  storage: createStorage('profiles'),
  limits: {
    fileSize: UPLOAD_CONFIG.PROFILE_PHOTO.maxSize
  },
  fileFilter: createFileFilter(UPLOAD_CONFIG.PROFILE_PHOTO.allowedTypes)
}).single('photo');

/**
 * Listing images upload middleware (multiple files)
 */
export const uploadListingImages = multer({
  storage: createStorage('listings', 'images'),
  limits: {
    fileSize: UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxSize,
    files: UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles
  },
  fileFilter: createFileFilter(UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.allowedTypes)
}).array('images', UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles);

/**
 * Listing videos upload middleware (multiple files)
 */
export const uploadListingVideos = multer({
  storage: createStorage('listings', 'videos'),
  limits: {
    fileSize: UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxSize,
    files: UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles
  },
  fileFilter: createFileFilter(UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.allowedTypes)
}).array('videos', UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles);

/**
 * Listing media upload middleware (images or videos based on field name)
 */
export const uploadListingMedia = multer({
  storage: STORAGE_TYPE === 'cloudinary' 
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: async (req, file, cb) => {
          try {
            // Determine media type from field name or mime type
            const isVideo = file.mimetype.startsWith('video/');
            const mediaType = isVideo ? 'videos' : 'images';
            
            const uploadPath = path.join(
              process.cwd(),
              'uploads',
              'listings',
              `user-${req.user.userId}`,
              mediaType
            );

            await ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
          } catch (error) {
            cb(error, null);
          }
        },
        filename: (req, file, cb) => {
          try {
            const uniqueName = generateFileName(file.originalname);
            cb(null, uniqueName);
          } catch (error) {
            cb(error, null);
          }
        }
      }),
  limits: {
    fileSize: UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxSize, // Use larger limit
    files: UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles + UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles
  },
  fileFilter: (req, file, cb) => {
    const allAllowedTypes = [
      ...UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.allowedTypes,
      ...UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.allowedTypes
    ];
    
    if (allAllowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allAllowedTypes.join(', ')}`), false);
    }
  }
}).array('media', UPLOAD_CONFIG.LISTING_MEDIA.IMAGE.maxFiles + UPLOAD_CONFIG.LISTING_MEDIA.VIDEO.maxFiles);

/**
 * Chat image upload middleware (single file)
 */
export const uploadChatImage = multer({
  storage: createStorage('chats', 'images'),
  limits: {
    fileSize: UPLOAD_CONFIG.CHAT_IMAGE.maxSize
  },
  fileFilter: createFileFilter(UPLOAD_CONFIG.CHAT_IMAGE.allowedTypes)
}).single('image');
