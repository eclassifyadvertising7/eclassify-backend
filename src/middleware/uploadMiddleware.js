import multer from 'multer';
import path from 'path';
import { UPLOAD_CONFIG, isValidFileType, getFileExtension } from '#uploads/uploadConfig.js';
import { ERROR_MESSAGES } from '#utils/constants/messages.js';

/**
 * Get storage configuration based on STORAGE_TYPE environment variable
 * - local: Save to disk
 * - cloudinary/s3: Use memory storage (files uploaded via API)
 */
const getStorage = () => {
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 'local') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || './uploads/profiles');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = getFileExtension(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
      }
    });
  }

  // For cloudinary/s3, use memory storage
  return multer.memoryStorage();
};

/**
 * File filter for profile photo uploads
 */
const profilePhotoFilter = (req, file, cb) => {
  const { allowedTypes } = UPLOAD_CONFIG.PROFILE_PHOTO;

  if (!isValidFileType(file.mimetype, allowedTypes)) {
    return cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
  }

  cb(null, true);
};

/**
 * Multer upload middleware for profile photos
 */
export const uploadProfilePhoto = multer({
  storage: getStorage(),
  limits: {
    fileSize: UPLOAD_CONFIG.PROFILE_PHOTO.maxSize
  },
  fileFilter: profilePhotoFilter
}).single('profilePhoto');

/**
 * Generic single file upload middleware
 * @param {string} fieldName - Form field name
 * @param {string} uploadType - Upload type (profiles, listings, etc.)
 * @returns {Function} Multer middleware
 */
export const uploadSingle = (fieldName = 'file', uploadType = 'profiles') => {
  const storageType = process.env.STORAGE_TYPE || 'local';
  
  const storage = storageType === 'local'
    ? multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = process.env.UPLOAD_DIR || './uploads';
          cb(null, `${uploadDir}/${uploadType}`);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = getFileExtension(file.originalname);
          cb(null, `${uploadType}-${uniqueSuffix}${ext}`);
        }
      })
    : multer.memoryStorage();

  return multer({
    storage,
    limits: {
      fileSize: UPLOAD_CONFIG.PROFILE_PHOTO.maxSize
    },
    fileFilter: (req, file, cb) => {
      const { allowedTypes } = UPLOAD_CONFIG.PROFILE_PHOTO;
      if (!isValidFileType(file.mimetype, allowedTypes)) {
        return cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
      }
      cb(null, true);
    }
  }).single(fieldName);
};

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.FILE_TOO_LARGE,
        data: null
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null
    });
  }

  next();
};
