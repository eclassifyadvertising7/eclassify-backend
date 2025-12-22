/**
 * Public Listing Controller
 * Handles public listing browsing and viewing
 */

import listingService from '#services/listingService.js';
import categoryRepository from '#repositories/categoryRepository.js';
import { successResponse, errorResponse, validationErrorResponse } from '#utils/responseFormatter.js';
import LocationHelper from '#utils/locationHelper.js';
import activityLogMiddleware from '#middleware/activityLogMiddleware.js';

class ListingController {
  /**
   * Get listings for homepage (simple, no filters)
   * GET /api/public/listings/homepage
   */
  static async homepage(req, res) {
    try {
      const userId = req.user?.userId || null; // Get user ID if authenticated

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const filters = {
        status: 'active',
        sortBy: 'date_desc' // Newest first
      };

      const result = await listingService.getAll(filters, pagination, userId);
      return successResponse(res, result.data, result.message, result.pagination);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Browse category listings with advanced filters
   * GET /api/public/listings/category/:categorySlugOrId
   */
  static async browseByCategory(req, res) {
    try {
      const { categorySlugOrId } = req.params;
      const userId = req.user?.userId || null; // Get user ID if authenticated
      
      // Determine if it's a slug or ID and validate category exists
      const isNumeric = /^\d+$/.test(categorySlugOrId);
      let category;
      let categoryFilter;
      
      if (isNumeric) {
        const categoryId = parseInt(categorySlugOrId);
        category = await categoryRepository.getById(categoryId);
        categoryFilter = { categoryId };
      } else {
        category = await categoryRepository.getBySlug(categorySlugOrId);
        categoryFilter = category ? { categoryId: category.id } : { categorySlug: categorySlugOrId };
      }
      
      // Validate category exists
      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }
      
      // Validate category is active
      if (!category.isActive) {
        return errorResponse(res, 'Category is not active', 400);
      }

      const filters = {
        status: 'active',
        ...categoryFilter,
        
        // Basic filters
        stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId) : undefined,
        isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
        
        // Price filters
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        
        // Search
        search: req.query.search,
        
        // Sort
        sortBy: req.query.sortBy || 'date_desc',
        
        // Car-specific filters
        brandId: req.query.brandId ? parseInt(req.query.brandId) : undefined,
        modelId: req.query.modelId ? parseInt(req.query.modelId) : undefined,
        variantId: req.query.variantId ? parseInt(req.query.variantId) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear) : undefined,
        condition: req.query.condition,
        fuelType: req.query.fuelType,
        transmission: req.query.transmission,
        bodyType: req.query.bodyType,
        minMileage: req.query.minMileage ? parseInt(req.query.minMileage) : undefined,
        maxMileage: req.query.maxMileage ? parseInt(req.query.maxMileage) : undefined,
        ownersCount: req.query.ownersCount ? parseInt(req.query.ownersCount) : undefined,
        
        // Property-specific filters
        propertyType: req.query.propertyType,
        listingType: req.query.listingType,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms) : undefined,
        minArea: req.query.minArea ? parseInt(req.query.minArea) : undefined,
        maxArea: req.query.maxArea ? parseInt(req.query.maxArea) : undefined,
        furnished: req.query.furnished,
        facing: req.query.facing,
        parkingSpaces: req.query.parkingSpaces ? parseInt(req.query.parkingSpaces) : undefined
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
   * Browse all active listings with advanced filters (legacy - kept for backward compatibility)
   * GET /api/public/listings
   */
  static async browse(req, res) {
    try {
      const userId = req.user?.userId || null; // Get user ID if authenticated
      
      // Validate category if provided
      if (req.query.categoryId) {
        const categoryId = parseInt(req.query.categoryId);
        if (isNaN(categoryId)) {
          return errorResponse(res, 'Invalid category ID', 400);
        }
        
        const category = await categoryRepository.getById(categoryId);
        if (!category) {
          return errorResponse(res, 'Category not found', 404);
        }
        
        if (!category.isActive) {
          return errorResponse(res, 'Category is not active', 400);
        }
      }
      
      const filters = {
        status: 'active',
        
        // Basic filters
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
        stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId) : undefined,
        isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
        
        // Price filters
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        
        // Search
        search: req.query.search,
        
        // Sort
        sortBy: req.query.sortBy,
        
        // Car-specific filters
        brandId: req.query.brandId ? parseInt(req.query.brandId) : undefined,
        modelId: req.query.modelId ? parseInt(req.query.modelId) : undefined,
        variantId: req.query.variantId ? parseInt(req.query.variantId) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear) : undefined,
        condition: req.query.condition,
        fuelType: req.query.fuelType,
        transmission: req.query.transmission,
        bodyType: req.query.bodyType,
        minMileage: req.query.minMileage ? parseInt(req.query.minMileage) : undefined,
        maxMileage: req.query.maxMileage ? parseInt(req.query.maxMileage) : undefined,
        ownersCount: req.query.ownersCount ? parseInt(req.query.ownersCount) : undefined,
        
        // Property-specific filters
        propertyType: req.query.propertyType,
        listingType: req.query.listingType,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms) : undefined,
        minArea: req.query.minArea ? parseInt(req.query.minArea) : undefined,
        maxArea: req.query.maxArea ? parseInt(req.query.maxArea) : undefined,
        furnished: req.query.furnished,
        facing: req.query.facing,
        parkingSpaces: req.query.parkingSpaces ? parseInt(req.query.parkingSpaces) : undefined
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
   * Get featured listings
   * GET /api/public/listings/featured
   */
  static async getFeatured(req, res) {
    try {
      const userId = req.user?.userId || null; // Get user ID if authenticated
      
      // Validate category if provided
      if (req.query.categoryId) {
        const categoryId = parseInt(req.query.categoryId);
        if (isNaN(categoryId)) {
          return errorResponse(res, 'Invalid category ID', 400);
        }
        
        const category = await categoryRepository.getById(categoryId);
        if (!category) {
          return errorResponse(res, 'Category not found', 404);
        }
        
        if (!category.isActive) {
          return errorResponse(res, 'Category is not active', 400);
        }
      }
      
      const filters = {
        status: 'active',
        isFeatured: true,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined
      };

      const pagination = {
        page: 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10
      };

      const result = await listingService.getAll(filters, pagination, userId);
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
      const userId = req.user?.userId || null; // Get user ID if authenticated

      const result = await listingService.getBySlug(slug, userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Search listings with advanced filtering and ranking
   * GET /api/public/listings/search
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

      // Build user context
      const userContext = {
        userId: req.user?.userId || null,
        sessionId: req.activityData?.sessionId || 'anonymous',
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
   * Get search suggestions for autocomplete
   * GET /api/public/listings/search/suggestions
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
   * Get available search filters for category
   * GET /api/public/listings/search/filters/:categoryId?
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
   * Get featured listings with location-based ranking
   * GET /api/public/listings/featured
   */
  static async getFeatured(req, res) {
    try {
      const userId = req.user?.userId || null; // Get user ID if authenticated
      
      const {
        categoryId,
        stateId,
        cityId,
        limit = 10
      } = req.query;

      // Validate category if provided
      if (categoryId) {
        const categoryIdNum = parseInt(categoryId);
        if (isNaN(categoryIdNum)) {
          return errorResponse(res, 'Invalid category ID', 400);
        }
        
        const category = await categoryRepository.getById(categoryIdNum);
        if (!category) {
          return errorResponse(res, 'Category not found', 404);
        }
        
        if (!category.isActive) {
          return errorResponse(res, 'Category is not active', 400);
        }
      }

      const filters = {
        categoryId: categoryId ? parseInt(categoryId) : null,
        stateId: stateId ? parseInt(stateId) : null,
        cityId: cityId ? parseInt(cityId) : null
      };

      const userLocation = LocationHelper.parseUserLocation(req);
      const pagination = { page: 1, limit: Math.min(parseInt(limit), 20) };

      const result = await listingService.getFeaturedListings(filters, userLocation, pagination, userId);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getFeatured:', error);
      return errorResponse(res, 'Failed to get featured listings', 500);
    }
  }

  /**
   * Get similar listings
   * GET /api/public/listings/:id/similar
   */
  static async getSimilarListings(req, res) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      const userId = req.user?.userId || null; // Get user ID if authenticated

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, [{ field: 'id', message: 'Valid listing ID is required' }]);
      }

      const limitNum = Math.min(parseInt(limit), 10);

      const result = await listingService.getSimilarListings(parseInt(id), limitNum, userId);

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 404);
      }
    } catch (error) {
      console.error('Error in getSimilarListings:', error);
      return errorResponse(res, 'Failed to get similar listings', 500);
    }
  }

  /**
   * Increment view count
   * POST /api/public/listings/view/:id
   * Note: Does not increment for listing owner or super_admin
   */
  static async incrementViewCount(req, res) {
    try {
      const { id } = req.params;
      
      // Get user info if authenticated (optional)
      const userId = req.user?.userId || null;
      const userRoleSlug = req.user?.roleSlug || null;

      const result = await listingService.incrementViewCount(parseInt(id), userId, userRoleSlug);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ListingController;
