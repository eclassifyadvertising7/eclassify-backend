/**
 * Public Listing Controller
 * Handles public listing browsing and viewing
 */

import listingService from '#services/listingService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class ListingController {
  /**
   * Browse all active listings
   * GET /api/public/listings
   */
  static async browse(req, res) {
    try {
      const filters = {
        status: 'active',
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
        stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId) : undefined,
        isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        search: req.query.search,
        sortBy: req.query.sortBy
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await listingService.getAll(filters, pagination);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get featured listings
   * GET /api/public/listings/featured
   */
  static async getFeatured(req, res) {
    try {
      const filters = {
        status: 'active',
        isFeatured: true,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined
      };

      const pagination = {
        page: 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10
      };

      const result = await listingService.getAll(filters, pagination);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get listing by slug
   * GET /api/public/listings/:slug
   */
  static async getBySlug(req, res) {
    try {
      const { slug } = req.params;

      const result = await listingService.getBySlug(slug);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Increment view count
   * POST /api/public/listings/view/:id
   */
  static async incrementViewCount(req, res) {
    try {
      const { id } = req.params;

      const result = await listingService.incrementViewCount(parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ListingController;
