import categoryService from '#services/categoryService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class PublicCategoryController {
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
