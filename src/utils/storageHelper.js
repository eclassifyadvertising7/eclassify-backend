/**
 * Storage Helper Utility
 * Handles conversion between relative and absolute file paths/URLs
 */

import path from 'path';

/**
 * Convert relative path to absolute URL
 * @param {string} relativePath - Relative path from database (e.g., 'uploads/categories/file.jpg')
 * @returns {string|null} - Absolute URL or null if no path provided
 */
export const getFullUrl = (relativePath) => {
  if (!relativePath) return null;
  return `${process.env.UPLOAD_URL}/${relativePath}`;
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
