/**
 * Storage Helper Utility
 * Handles conversion between relative and absolute file paths/URLs
 * Supports local and Cloudinary storage
 */

import path from 'path';
import { cloudinary } from '#config/storageConfig.js';

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'eclassify_app';

/**
 * MIME type to file extension mapping
 */
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

/**
 * Convert relative path to absolute URL
 * @param {string} relativePath - Relative path without extension
 * @param {string} storageType - Storage type: 'local' or 'cloudinary'
 * @param {string} mimeType - MIME type of the file
 * @returns {string|null} - Absolute URL or null if no path provided
 */
export const getFullUrl = (relativePath, storageType, mimeType) => {
  if (!relativePath) return null;

  const ext = MIME_TO_EXT[mimeType] || 'jpg';

  // Cloudinary storage
  if (storageType === 'cloudinary') {
    const fullPublicId = `${CLOUDINARY_FOLDER}/${relativePath}`;
    return cloudinary.url(fullPublicId, { 
      format: ext,
      secure: true 
    });
  }

  // Local storage
  return `${process.env.UPLOAD_URL}/${relativePath}.${ext}`;
};

/**
 * Convert absolute file system path to relative path for database storage
 * @param {string} absolutePath - Absolute file system path
 * @returns {string} - Relative path with forward slashes (e.g., 'uploads/categories/file.jpg')
 */
export const getRelativePath = (absolutePath) => {
  return path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
};

/**
 * Convert multiple relative paths to absolute URLs
 * @param {Array<string>} relativePaths - Array of relative paths
 * @returns {Array<string>} - Array of absolute URLs
 */
export const getFullUrls = (relativePaths) => {
  if (!Array.isArray(relativePaths)) return [];
  return relativePaths.map(getFullUrl).filter(Boolean);
};
