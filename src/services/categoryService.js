/**
 * Category Service
 * Business logic for category management
 */

import categoryRepository from '#repositories/categoryRepository.js';
import imageService from '#services/imageService.js';
import { getFullUrl, getRelativePath } from '#utils/storageHelper.js';
import { customSlugify } from '#utils/customSlugify.js';
import { UPLOAD_CONFIG } from '#config/uploadConfig.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

class CategoryService {
  /**
   * Generate slug from name using customSlugify
   * @param {string} name - Category name
   * @returns {string}
   */
  _generateSlug(name) {
    return customSlugify(name);
  }

  /**
   * Convert category data with absolute URLs
   * @param {Object} category - Category data from DB
   * @returns {Object}
   */
  _convertToAbsoluteUrls(category) {
    if (!category) return null;

    const categoryData = category.toJSON ? category.toJSON() : category;

    return {
      ...categoryData,
      icon: getFullUrl(categoryData.icon),
      imageUrl: getFullUrl(categoryData.imageUrl)
    };
  }

  /**
   * Convert multiple categories with absolute URLs
   * @param {Array} categories - Array of categories
   * @returns {Array}
   */
  _convertMultipleToAbsoluteUrls(categories) {
    return categories.map(category => this._convertToAbsoluteUrls(category));
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @param {Object} files - Uploaded files (icon, image)
   * @param {number} userId - User ID creating the category
   * @param {string} userName - User name creating the category
   * @returns {Promise<Object>}
   */
  async create(categoryData, files = {}, userId, userName) {
    try {
      // Validate required fields
      if (!categoryData.name || categoryData.name.length < 2) {
        throw new Error('Category name must be at least 2 characters');
      }

      // Generate slug if not provided
      if (!categoryData.slug) {
        categoryData.slug = this._generateSlug(categoryData.name);
      } else {
        // Slugify provided slug
        categoryData.slug = customSlugify(categoryData.slug);
      }

      // Check if slug already exists
      const slugExists = await categoryRepository.slugExists(categoryData.slug);
      if (slugExists) {
        throw new Error('Category slug already exists');
      }

      // Check if name already exists
      const nameExists = await categoryRepository.nameExists(categoryData.name);
      if (nameExists) {
        throw new Error('Category name already exists');
      }

      // Handle icon upload
      if (files.icon) {
        const relativePath = getRelativePath(files.icon.path);
        
        // Process icon
        await imageService.processImage(files.icon.path, UPLOAD_CONFIG.CATEGORY_IMAGE);
        
        categoryData.icon = relativePath;
      }

      // Handle image upload
      if (files.image) {
        const relativePath = getRelativePath(files.image.path);
        
        // Process image
        await imageService.processImage(files.image.path, UPLOAD_CONFIG.CATEGORY_IMAGE);
        
        categoryData.imageUrl = relativePath;
      }

      // Set audit fields
      categoryData.createdBy = userId;

      // Create category
      const category = await categoryRepository.create(categoryData);

      return {
        success: true,
        message: SUCCESS_MESSAGES.CATEGORY_CREATED,
        data: this._convertToAbsoluteUrls(category)
      };
    } catch (error) {
      // Clean up uploaded files if category creation fails
      if (files.icon) {
        await imageService.deleteImage(getRelativePath(files.icon.path));
      }
      if (files.image) {
        await imageService.deleteImage(getRelativePath(files.image.path));
      }

      throw error;
    }
  }

  /**
   * Get all categories
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}) {
    const categories = await categoryRepository.getAll(filters);

    return {
      success: true,
      message: SUCCESS_MESSAGES.CATEGORIES_FETCHED,
      data: this._convertMultipleToAbsoluteUrls(categories)
    };
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const category = await categoryRepository.getById(id);

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CATEGORY_FETCHED,
      data: this._convertToAbsoluteUrls(category)
    };
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>}
   */
  async getBySlug(slug) {
    const category = await categoryRepository.getBySlug(slug);

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CATEGORY_FETCHED,
      data: this._convertToAbsoluteUrls(category)
    };
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} updateData - Update data
   * @param {Object} files - Uploaded files (icon, image)
   * @param {number} userId - User ID updating the category
   * @param {string} userName - User name updating the category
   * @returns {Promise<Object>}
   */
  async update(id, updateData, files = {}, userId, userName) {
    try {
      const category = await categoryRepository.getById(id);

      if (!category) {
        throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
      }

      // Validate name if provided
      if (updateData.name && updateData.name.length < 2) {
        throw new Error('Category name must be at least 2 characters');
      }

      // Check if name already exists (excluding current category)
      if (updateData.name) {
        const nameExists = await categoryRepository.nameExists(updateData.name, id);
        if (nameExists) {
          throw new Error('Category name already exists');
        }
      }

      // Slugify slug if provided
      if (updateData.slug) {
        updateData.slug = customSlugify(updateData.slug);
        
        // Check if slug already exists (excluding current category)
        const slugExists = await categoryRepository.slugExists(updateData.slug, id);
        if (slugExists) {
          throw new Error('Category slug already exists');
        }
      }

      // Handle icon upload
      if (files.icon) {
        // Delete old icon if exists
        if (category.icon) {
          await imageService.deleteImage(category.icon);
        }

        const relativePath = getRelativePath(files.icon.path);
        
        // Process new icon
        await imageService.processImage(files.icon.path, UPLOAD_CONFIG.CATEGORY_IMAGE);
        
        updateData.icon = relativePath;
      }

      // Handle image upload
      if (files.image) {
        // Delete old image if exists
        if (category.imageUrl) {
          await imageService.deleteImage(category.imageUrl);
        }

        const relativePath = getRelativePath(files.image.path);
        
        // Process new image
        await imageService.processImage(files.image.path, UPLOAD_CONFIG.CATEGORY_IMAGE);
        
        updateData.imageUrl = relativePath;
      }

      // Update category
      const updatedCategory = await categoryRepository.update(id, updateData, { userId, userName });

      return {
        success: true,
        message: SUCCESS_MESSAGES.CATEGORY_UPDATED,
        data: this._convertToAbsoluteUrls(updatedCategory)
      };
    } catch (error) {
      // Clean up uploaded files if update fails
      if (files.icon) {
        await imageService.deleteImage(getRelativePath(files.icon.path));
      }
      if (files.image) {
        await imageService.deleteImage(getRelativePath(files.image.path));
      }

      throw error;
    }
  }

  /**
   * Update category status
   * @param {number} id - Category ID
   * @param {boolean} isActive - Active status
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async updateStatus(id, isActive, userId, userName) {
    const category = await categoryRepository.updateStatus(id, isActive, { userId, userName });

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CATEGORY_STATUS_UPDATED,
      data: this._convertToAbsoluteUrls(category)
    };
  }

  /**
   * Update category featured status
   * @param {number} id - Category ID
   * @param {boolean} isFeatured - Featured status
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @returns {Promise<Object>}
   */
  async updateFeaturedStatus(id, isFeatured, userId, userName) {
    const category = await categoryRepository.updateFeaturedStatus(id, isFeatured, { userId, userName });

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CATEGORY_FEATURED_UPDATED,
      data: this._convertToAbsoluteUrls(category)
    };
  }

  /**
   * Delete category
   * @param {number} id - Category ID
   * @param {number} userId - User ID deleting the category
   * @returns {Promise<Object>}
   */
  async delete(id, userId) {
    const category = await categoryRepository.getById(id);

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    // Delete associated images
    if (category.icon) {
      await imageService.deleteImage(category.icon);
    }
    if (category.imageUrl) {
      await imageService.deleteImage(category.imageUrl);
    }

    const deleted = await categoryRepository.delete(id, userId);

    if (!deleted) {
      throw new Error(ERROR_MESSAGES.CATEGORY_DELETE_FAILED);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CATEGORY_DELETED,
      data: null
    };
  }
}

// Export singleton instance
export default new CategoryService();
