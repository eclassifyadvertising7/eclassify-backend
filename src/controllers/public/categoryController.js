/**
 * Public Category Controller
 * Handles public category browsing (no authentication required)
 */

import categoryService from '#services/categoryService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class PublicCategoryController {
  /**
   * Get all active categories
   * GET /api/public/categories
   */
  static async getAll(req, res) {
    try {
      const filters = {
        isActive: true,
        isFeatured: req.query.featured === 'true' ? true : undefined
      };

      const result = await categoryService.getAll(filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get category by slug
   * GET /api/public/categories/:slug
   */
  static async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const result = await categoryService.getBySlug(slug);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
}

export default PublicCategoryController;
