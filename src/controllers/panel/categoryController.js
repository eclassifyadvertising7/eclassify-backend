/**
 * Panel Category Controller
 * Handles admin/staff category management operations
 */

import categoryService from '#services/categoryService.js';
import { successResponse, errorResponse, createResponse } from '#utils/responseFormatter.js';

class CategoryController {
  /**
   * Create new category
   * POST /api/panel/categories
   */
  static async create(req, res) {
    try {
      // Parse and convert form data types
      const categoryData = {
        name: req.body.name?.trim(),
        slug: req.body.slug?.trim(),
        description: req.body.description?.trim(),
        displayOrder: req.body.displayOrder ? parseInt(req.body.displayOrder, 10) : 0,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
        isActive: req.body.isActive === 'true' || req.body.isActive === true
      };

      const files = {
        icon: req.files?.icon?.[0],
        image: req.files?.image?.[0]
      };

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await categoryService.create(categoryData, files, userId, userName);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get all categories (including inactive)
   * GET /api/panel/categories
   */
  static async getAll(req, res) {
    try {
      const filters = {
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
        search: req.query.search
      };

      const result = await categoryService.getAll(filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get category by ID
   * GET /api/panel/categories/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.getById(parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Update category
   * PUT /api/panel/categories/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      // Parse and convert form data types (only include provided fields)
      const updateData = {};
      
      if (req.body.name !== undefined) {
        updateData.name = req.body.name.trim();
      }
      if (req.body.slug !== undefined) {
        updateData.slug = req.body.slug.trim();
      }
      if (req.body.description !== undefined) {
        updateData.description = req.body.description.trim();
      }
      if (req.body.displayOrder !== undefined) {
        updateData.displayOrder = parseInt(req.body.displayOrder, 10);
      }
      if (req.body.isFeatured !== undefined) {
        updateData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
      }
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
      }

      const files = {
        icon: req.files?.icon?.[0],
        image: req.files?.image?.[0]
      };

      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      const result = await categoryService.update(parseInt(id), updateData, files, userId, userName);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update category status
   * PATCH /api/panel/categories/status/:id
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      if (isActive === undefined) {
        return errorResponse(res, 'isActive field is required', 400);
      }

      const result = await categoryService.updateStatus(parseInt(id), isActive, userId, userName);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update category featured status
   * PATCH /api/panel/categories/featured/:id
   */
  static async updateFeaturedStatus(req, res) {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;
      const userId = req.user.userId;
      const userName = req.user.email || req.user.mobile;

      if (isFeatured === undefined) {
        return errorResponse(res, 'isFeatured field is required', 400);
      }

      const result = await categoryService.updateFeaturedStatus(parseInt(id), isFeatured, userId, userName);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete category
   * DELETE /api/panel/categories/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await categoryService.delete(parseInt(id), userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default CategoryController;
