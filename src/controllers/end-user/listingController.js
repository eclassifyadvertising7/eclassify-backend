/**
 * End-User Listing Controller
 * Handles user's own listing operations
 */

import listingService from '#services/listingService.js';
import carListingService from '#services/carListingService.js';
import propertyListingService from '#services/propertyListingService.js';
import listingMediaService from '#services/listingMediaService.js';
import { successResponse, errorResponse, createResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import { 
  parseListingData, 
  parseCarListingData, 
  parsePropertyListingData 
} from '#utils/formDataParser.js';
import LocationHelper from '#utils/locationHelper.js';

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
   * Get personalized feed for authenticated user
   * GET /api/end-user/listings/feed
   */
  static async getFeed(req, res) {
    try {
      const userId = req.user.userId;

      const filters = {
        status: 'active',
        
        // Optional filters
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
        stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        search: req.query.search,
        sortBy: req.query.sortBy || 'date_desc'
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      // TODO: Add personalization logic based on user preferences, browsing history, location
      // For now, returns active listings with optional filters
      const result = await listingService.getAll(filters, pagination, userId);
      return successResponse(res, result.data, 'Personalized feed retrieved successfully', result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get my listings (management view)
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

      const result = await listingService.getAll(filters, pagination, userId);
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
   * Personalized search with user history and preferences
   * GET /api/end-user/listings/search
   */
  static async searchListings(req, res) {
    try {
      const {
        query,
        categoryId,
        priceMin,
        priceMax,
        stateId,
        cityId,
        locality,
        postedByType,
        featuredOnly,
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        // Car-specific filters
        brandId,
        modelId,
        variantId,
        year,
        fuelType,
        transmission,
        condition,
        minMileage,
        maxMileage,
        // Property-specific filters
        propertyType,
        bedrooms,
        bathrooms,
        minArea,
        maxArea
      } = req.query;

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 50); // Max 50 items per page

      if (pageNum < 1 || limitNum < 1) {
        return validationErrorResponse(res, [{ field: 'pagination', message: 'Invalid pagination parameters' }]);
      }

      // Build search parameters
      const searchParams = {
        query: query?.trim() || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        stateId: stateId ? parseInt(stateId) : null,
        cityId: cityId ? parseInt(cityId) : null,
        locality: locality?.trim() || null,
        postedByType,
        featuredOnly: featuredOnly === 'true',
        sortBy,
        filters: {
          // Car filters
          brandId: brandId ? parseInt(brandId) : null,
          modelId: modelId ? parseInt(modelId) : null,
          variantId: variantId ? parseInt(variantId) : null,
          year: year ? parseInt(year) : null,
          fuelType,
          transmission,
          condition,
          minMileage: minMileage ? parseInt(minMileage) : null,
          maxMileage: maxMileage ? parseInt(maxMileage) : null,
          // Property filters
          propertyType,
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          bathrooms: bathrooms ? parseInt(bathrooms) : null,
          minArea: minArea ? parseInt(minArea) : null,
          maxArea: maxArea ? parseInt(maxArea) : null
        }
      };

      // Build user context with authentication
      const userContext = {
        userId: req.user.userId,
        sessionId: req.activityData?.sessionId || `user_${req.user.userId}`,
        userLocation: LocationHelper.parseUserLocation(req),
        ipAddress: req.activityData?.ipAddress,
        userAgent: req.activityData?.userAgent,
        user: req.user
      };

      const pagination = { page: pageNum, limit: limitNum };

      const result = await listingService.searchListings(searchParams, userContext, pagination);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in searchListings:', error);
      return errorResponse(res, 'Failed to search listings', 500);
    }
  }

  /**
   * Get search suggestions based on user history
   * GET /api/end-user/listings/search/suggestions
   */
  static async getSearchSuggestions(req, res) {
    try {
      const { query, limit = 5 } = req.query;

      if (!query || query.length < 2) {
        return successResponse(res, { suggestions: [] }, 'No suggestions for short query');
      }

      const userLocation = LocationHelper.parseUserLocation(req);
      const limitNum = Math.min(parseInt(limit), 10);

      const result = await listingService.getSearchSuggestions(query, userLocation, limitNum);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getSearchSuggestions:', error);
      return errorResponse(res, 'Failed to get search suggestions', 500);
    }
  }

  /**
   * Get available search filters
   * GET /api/end-user/listings/search/filters/:categoryId?
   */
  static async getSearchFilters(req, res) {
    try {
      const { categoryId } = req.params;
      const userLocation = LocationHelper.parseUserLocation(req);

      const result = await listingService.getSearchFilters(
        categoryId ? parseInt(categoryId) : null,
        userLocation
      );

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getSearchFilters:', error);
      return errorResponse(res, 'Failed to get search filters', 500);
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
