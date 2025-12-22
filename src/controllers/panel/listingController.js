/**
 * Panel Listing Controller
 * Handles admin/staff listing management operations
 */

import listingService from '#services/listingService.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import LocationHelper from '#utils/locationHelper.js';

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

      // Admin users don't need isFavorited field, pass null
      const result = await listingService.getAll(filters, pagination, null);
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
   * Advanced search for admin panel
   * GET /api/panel/listings/search
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
        status, // Admin can search by any status
        userId, // Admin can search by specific user
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
      const limitNum = Math.min(parseInt(limit), 100); // Higher limit for admin

      if (pageNum < 1 || limitNum < 1) {
        return validationErrorResponse(res, [{ field: 'pagination', message: 'Invalid pagination parameters' }]);
      }

      // Build search parameters (admin can search all statuses)
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
        status: status || null, // Admin can filter by any status
        userId: userId ? parseInt(userId) : null, // Admin can filter by user
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

      // Build admin user context
      const userContext = {
        userId: req.user.id,
        sessionId: `admin_${req.user.id}`,
        userLocation: LocationHelper.parseUserLocation(req),
        ipAddress: req.activityData?.ipAddress,
        userAgent: req.activityData?.userAgent,
        user: req.user,
        isAdmin: true
      };

      const pagination = { page: pageNum, limit: limitNum };

      // Use the existing getAll method for admin searches (more appropriate for admin panel)
      const filters = {
        ...searchParams,
        search: searchParams.query,
        // Remove null values
        ...Object.fromEntries(
          Object.entries(searchParams).filter(([_, v]) => v !== null && v !== undefined)
        )
      };

      // Admin users don't need isFavorited field, pass null
      const result = await listingService.getAll(filters, pagination, null);

      return successResponse(res, result.data, 'Admin search results retrieved successfully', result.pagination);
    } catch (error) {
      console.error('Error in admin searchListings:', error);
      return errorResponse(res, 'Failed to search listings', 500);
    }
  }

  /**
   * Get search analytics for admin
   * GET /api/panel/listings/search/analytics
   */
  static async getSearchAnalytics(req, res) {
    try {
      const {
        startDate,
        endDate,
        categoryId
      } = req.query;

      // This would integrate with the search analytics from user search logs
      // For now, return basic listing statistics
      const result = await listingService.getStats();

      // Add search-specific analytics here
      const analytics = {
        ...result.data,
        searchPeriod: {
          startDate: startDate || null,
          endDate: endDate || null
        },
        categoryFilter: categoryId ? parseInt(categoryId) : null
      };

      return successResponse(res, analytics, 'Search analytics retrieved successfully');
    } catch (error) {
      console.error('Error in getSearchAnalytics:', error);
      return errorResponse(res, 'Failed to get search analytics', 500);
    }
  }

  /**
   * Get popular search keywords from listings
   * GET /api/panel/listings/search/keywords
   */
  static async getPopularKeywords(req, res) {
    try {
      const { limit = 20 } = req.query;

      // This would analyze keywords from listings and search logs
      // For now, return a placeholder response
      const keywords = [
        { keyword: 'honda city', count: 245, category: 'Cars' },
        { keyword: 'maruti swift', count: 189, category: 'Cars' },
        { keyword: '2bhk apartment', count: 156, category: 'Properties' },
        { keyword: 'automatic transmission', count: 134, category: 'Cars' },
        { keyword: 'furnished house', count: 98, category: 'Properties' }
      ];

      return successResponse(res, { 
        keywords: keywords.slice(0, parseInt(limit)),
        totalAnalyzed: 1000 
      }, 'Popular keywords retrieved successfully');
    } catch (error) {
      console.error('Error in getPopularKeywords:', error);
      return errorResponse(res, 'Failed to get popular keywords', 500);
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
