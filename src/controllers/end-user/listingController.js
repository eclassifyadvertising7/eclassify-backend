/**
 * End-User Listing Controller
 * Handles user's own listing operations
 */

import listingService from '#services/listingService.js';
import carListingService from '#services/carListingService.js';
import propertyListingService from '#services/propertyListingService.js';
import listingMediaService from '#services/listingMediaService.js';
import { successResponse, errorResponse, createResponse } from '#utils/responseFormatter.js';
import { 
  parseListingData, 
  parseCarListingData, 
  parsePropertyListingData 
} from '#utils/formDataParser.js';

class ListingController {
  /**
   * Create new listing
   * POST /api/end-user/listings
   */
  static async create(req, res) {
    try {
      const userId = req.user.userId;

      // Parse and sanitize base listing data
      const listingData = parseListingData(req.body);

      // Parse category-specific data
      let categoryData = null;

      if (req.body.categoryType === 'car') {
        const carData = parseCarListingData(req.body);
        categoryData = {
          type: 'car',
          data: carListingService.prepareCarData(carData)
        };
      } else if (req.body.categoryType === 'property') {
        const propertyData = parsePropertyListingData(req.body);
        categoryData = {
          type: 'property',
          data: propertyListingService.preparePropertyData(propertyData)
        };
      }

      const result = await listingService.create(listingData, categoryData, userId);
      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get my listings
   * GET /api/end-user/listings
   */
  static async getMyListings(req, res) {
    try {
      const userId = req.user.userId;

      const filters = {
        userId,
        status: req.query.status,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
        search: req.query.search
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
   * Get my listing by ID
   * GET /api/end-user/listings/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await listingService.getById(parseInt(id), userId, false);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Update my listing
   * PUT /api/end-user/listings/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Parse and sanitize update data (only include provided fields)
      const updateData = {};
      const body = req.body;

      if (body.title !== undefined) updateData.title = body.title?.trim();
      if (body.description !== undefined) updateData.description = body.description?.trim();
      if (body.price !== undefined) updateData.price = parseFloat(body.price);
      if (body.priceNegotiable !== undefined) {
        updateData.priceNegotiable = body.priceNegotiable === 'true' || body.priceNegotiable === true;
      }
      if (body.stateId !== undefined) updateData.stateId = parseInt(body.stateId);
      if (body.cityId !== undefined) updateData.cityId = parseInt(body.cityId);
      if (body.locality !== undefined) updateData.locality = body.locality?.trim() || null;
      if (body.address !== undefined) updateData.address = body.address?.trim() || null;
      if (body.latitude !== undefined) updateData.latitude = body.latitude ? parseFloat(body.latitude) : null;
      if (body.longitude !== undefined) updateData.longitude = body.longitude ? parseFloat(body.longitude) : null;

      // Parse category-specific data
      let categoryData = null;

      if (body.categoryType === 'car' && body.carData) {
        const carData = typeof body.carData === 'string' ? JSON.parse(body.carData) : body.carData;
        categoryData = {
          type: 'car',
          data: carListingService.prepareCarData(carData)
        };
      } else if (body.categoryType === 'property' && body.propertyData) {
        const propertyData = typeof body.propertyData === 'string' ? JSON.parse(body.propertyData) : body.propertyData;
        categoryData = {
          type: 'property',
          data: propertyListingService.preparePropertyData(propertyData)
        };
      }

      const result = await listingService.update(parseInt(id), updateData, categoryData, userId, false);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Submit listing for approval
   * POST /api/end-user/listings/submit/:id
   */
  static async submit(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      // Validate explicit status
      if (status !== 'pending') {
        return errorResponse(res, 'Status must be "pending" to submit for approval', 400);
      }

      const result = await listingService.submit(parseInt(id), userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Mark listing as sold
   * PATCH /api/end-user/listings/sold/:id
   */
  static async markAsSold(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      // Validate explicit status
      if (status !== 'sold') {
        return errorResponse(res, 'Status must be "sold" to mark listing as sold', 400);
      }

      const result = await listingService.markAsSold(parseInt(id), userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete my listing
   * DELETE /api/end-user/listings/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await listingService.delete(parseInt(id), userId, false);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Upload media for listing (images and/or videos)
   * POST /api/end-user/listings/media/:id
   */
  static async uploadMedia(req, res) {
    try {
      const { id } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return errorResponse(res, 'No files uploaded', 400);
      }

      const result = await listingMediaService.uploadMedia(parseInt(id), files);
      
      // If there were partial errors, return 207 Multi-Status
      if (result.errors && result.errors.length > 0) {
        return res.status(207).json({
          success: true,
          message: result.message,
          data: result.data,
          errors: result.errors
        });
      }

      return createResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete media from listing
   * DELETE /api/end-user/listings/delete-media/:id/media/:mediaId
   */
  static async deleteMedia(req, res) {
    try {
      const { id, mediaId } = req.params;

      const result = await listingMediaService.delete(parseInt(mediaId), parseInt(id));
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get my listing statistics
   * GET /api/end-user/listings/stats
   */
  static async getMyStats(req, res) {
    try {
      const userId = req.user.userId;

      const result = await listingService.getStats(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ListingController;
