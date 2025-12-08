/**
 * Storage Configuration
 * Handles file uploads to local storage or Cloudinary based on STORAGE_TYPE
 */

import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs/promises';
import { generateFileName } from '#utils/customSlugify.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'eclassify_app';

/**
 * Upload file to storage (local or Cloudinary)
 * @param {Object} file - Multer file object or file buffer
 * @param {string} folder - Folder path (e.g., 'categories', 'listings/user-123/images')
 * @param {Object} options - Additional options (resource_type, transformation, etc.)
 * @returns {Promise<Object>} - { url, publicId, storageType }
 */
export const uploadFile = async (file, folder, options = {}) => {
  if (STORAGE_TYPE === 'cloudinary') {
    return uploadToCloudinary(file, folder, options);
  }
  return uploadToLocal(file, folder);
};

/**
 * Upload to Cloudinary
 */
const uploadToCloudinary = async (file, folder, options = {}) => {
  try {
    // Generate unique filename using customSlugify
    const fullFilename = generateFileName(file.originalname);
    // Remove extension for publicId (Cloudinary doesn't need it)
    const filenameWithoutExt = path.basename(fullFilename, path.extname(fullFilename));
    
    // Construct publicId (path without extension)
    const publicId = `${CLOUDINARY_FOLDER}/${folder}/${filenameWithoutExt}`;
    
    const uploadOptions = {
      public_id: publicId,
      asset_folder: `${CLOUDINARY_FOLDER}/${folder}`, // Creates folder structure in Cloudinary UI
      resource_type: options.resourceType || 'auto',
      overwrite: false,
      ...options
    };

    let result;
    
    // Handle different file input types
    if (file.path) {
      // File from multer with path
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
      // Delete local temp file after upload
      await fs.unlink(file.path).catch(() => {});
    } else if (file.buffer) {
      // File buffer
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(file.buffer);
      });
    } else {
      throw new Error('Invalid file object');
    }

    // Return relative path (without CLOUDINARY_FOLDER prefix)
    const relativePath = result.public_id.replace(`${CLOUDINARY_FOLDER}/`, '');

    return {
      url: result.secure_url,
      publicId: relativePath, // Store relative path for storage-agnostic approach
      storageType: 'cloudinary',
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload to local storage
 */
const uploadToLocal = async (file, folder) => {
  try {
    // For local storage, file is already saved by multer
    // Get relative path and remove extension (to match Cloudinary behavior)
    const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
    const relativePathWithoutExt = relativePath.replace(/\.[^.]+$/, ''); // Remove extension
    
    return {
      url: `${process.env.UPLOAD_URL}/${relativePath}`,
      publicId: relativePathWithoutExt, // Store without extension
      storageType: 'local',
      path: relativePathWithoutExt // Store without extension
    };
  } catch (error) {
    throw new Error(`Local upload failed: ${error.message}`);
  }
};

/**
 * Delete file from storage
 * @param {string} publicId - File public ID or path (without extension for local)
 * @param {string} storageType - 'local' or 'cloudinary'
 * @param {Object} options - Additional options (resource_type for Cloudinary, mimeType for local)
 */
export const deleteFile = async (publicId, storageType, options = {}) => {
  if (storageType === 'cloudinary') {
    return deleteFromCloudinary(publicId, options);
  }
  return deleteFromLocal(publicId, options.mimeType);
};

/**
 * Delete from Cloudinary
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: options.resourceType || 'image'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Delete from local storage
 */
const deleteFromLocal = async (filePath, mimeType) => {
  try {
    // Map MIME type to extension
    const MIME_TO_EXT = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi'
    };

    const ext = MIME_TO_EXT[mimeType] || 'jpg';
    const fullPath = path.join(process.cwd(), `${filePath}.${ext}`);
    await fs.unlink(fullPath);
    return { result: 'ok' };
  } catch (error) {
    console.error('Local delete error:', error);
    throw new Error(`Failed to delete from local storage: ${error.message}`);
  }
};

/**
 * Get file URL
 * @param {string} publicId - File public ID or relative path
 * @param {string} storageType - 'local' or 'cloudinary'
 * @returns {string} - Full URL
 */
export const getFileUrl = (publicId, storageType) => {
  if (storageType === 'cloudinary') {
    return cloudinary.url(publicId);
  }
  return `${process.env.UPLOAD_URL}/${publicId}`;
};

export { cloudinary };
