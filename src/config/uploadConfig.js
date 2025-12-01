/**
 * Upload configuration for file uploads
 * Defines file size limits, allowed types, and validation rules
 */

export const UPLOAD_CONFIG = {
  // Category images configuration
  CATEGORY_IMAGE: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80
  },

  // Profile photo configuration
  PROFILE_PHOTO: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxWidth: 1920,
    maxHeight: 1920,
    thumbnailSize: 150,
    quality: 80
  },

  // Listing media configuration
  LISTING_MEDIA: {
    IMAGE: {
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 15,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      maxWidth: 1920,
      maxHeight: 1080,
      thumbnailSize: 300,
      quality: 80
    },
    VIDEO: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 3,
      maxDuration: 60, // seconds
      allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
      allowedExtensions: ['.mp4', '.mov', '.avi']
    }
  },

  // Chat image configuration
  CHAT_IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxWidth: 1920,
    maxHeight: 1080,
    thumbnailSize: 300,
    quality: 85
  }
};

/**
 * Validate file type
 * @param {string} mimetype - File MIME type
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
export const isValidFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean}
 */
export const isValidFileSize = (size, maxSize) => {
  return size <= maxSize;
};

/**
 * Get file extension from filename
 * @param {string} filename - Original filename
 * @returns {string}
 */
export const getFileExtension = (filename) => {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
};
