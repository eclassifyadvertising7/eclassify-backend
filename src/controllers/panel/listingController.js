/**
 * Panel Listing Controller
 * Handles admin/staff listing management operations
 */

import listingService from '#services/listingService.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class ListingController {
  /**
   * Get all listings (admin view)
   * GET /api/panel/listings
   */
  static async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
        stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId) : undefined,
        userId: req.query.userId ? parseInt(req.query.userId) : undefined,
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
   * Get listing statistics
   * GET /api/panel/listings/stats
   */
  static async getStats(req, res) {
    try {
      const result = await listingService.getStats();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get listing by ID (admin view)
   * GET /api/panel/listings/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const result = await listingService.getById(parseInt(id), null, true);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Approve listing
   * PATCH /api/panel/listings/approve/:id
   */
  static async approve(req, res) {
    try {
      const { id } = req.params;
      const approvedBy = req.user.userId;

      const result = await listingService.approve(parseInt(id), approvedBy);
      
      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }
      
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Reject listing
   * PATCH /api/panel/listings/reject/:id
   */
  static async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const rejectedBy = req.user.userId;

      if (!reason) {
        return errorResponse(res, 'Rejection reason is required', 400);
      }

      const result = await listingService.reject(parseInt(id), rejectedBy, reason);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update featured status
   * PATCH /api/panel/listings/featured/:id
   */
  static async updateFeaturedStatus(req, res) {
    try {
      const { id } = req.params;
      const { isFeatured, days } = req.body;

      if (isFeatured === undefined) {
        return errorResponse(res, 'isFeatured field is required', 400);
      }

      const result = await listingService.updateFeaturedStatus(
        parseInt(id),
        isFeatured,
        days ? parseInt(days) : 7
      );
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete listing (admin)
   * DELETE /api/panel/listings/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await listingService.delete(parseInt(id), userId, true);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ListingController;
