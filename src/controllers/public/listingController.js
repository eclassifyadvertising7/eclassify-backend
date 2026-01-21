import listingService from '#services/listingService.js';
import categoryRepository from '#repositories/categoryRepository.js';
import { successResponse, errorResponse, validationErrorResponse, paginatedResponse } from '#utils/responseFormatter.js';
import LocationHelper from '#utils/locationHelper.js';

class ListingController {
  static async getHomepageListings(req, res) {
    try {
      const { categories, limit = 10, featuredLimit = 10 } = req.query;

      const categoryIds = categories ? categories.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
      
      const userLocation = await LocationHelper.parseUserLocation(req);

      const result = await listingService.getHomepageListings({
        categories: categoryIds,
        limit: parseInt(limit),
        featuredLimit: parseInt(featuredLimit),
        userLocation
      });

      if (!result.success) {
        return errorResponse(res, result.message, 500);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async homepage(req, res) {
    try {
      const userId = req.user?.userId || null;
      const userLocation = LocationHelper.parseUserLocation(req);

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const filters = {
        status: 'active',
        sortBy: 'date_desc'
      };

      const result = await listingService.getAll(filters, pagination, userId, userLocation);
      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async browseByCategory(req, res) {
    try {
      const { categorySlugOrId } = req.params;
      const userId = req.user?.userId || null;
      const userLocation = await LocationHelper.parseUserLocation(req);
      
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
      
      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }
      
      if (!category.isActive) {
        return errorResponse(res, 'Category is not active', 400);
      }

      const filters = {
        status: 'active',
        ...categoryFilter,
        
        stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId) : undefined,
        isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
        
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        
        postedByType: req.query.postedByType,
        
        search: req.query.search,
        
        sortBy: req.query.sortBy || 'date_desc',
        
        brandId: req.query.brandId ? parseInt(req.query.brandId) : undefined,
        modelId: req.query.modelId ? parseInt(req.query.modelId) : undefined,
        variantId: req.query.variantId ? parseInt(req.query.variantId) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear) : undefined,
        condition: req.query.condition,
        fuelType: req.query.fuelType,
        transmission: req.query.transmission,
        bodyType: req.query.bodyType,
        minMileage: req.query.minKilometers ? parseInt(req.query.minKilometers) : (req.query.minMileage ? parseInt(req.query.minMileage) : undefined),
        maxMileage: req.query.maxKilometers ? parseInt(req.query.maxKilometers) : (req.query.maxMileage ? parseInt(req.query.maxMileage) : undefined),
        ownersCount: req.query.ownersCount ? parseInt(req.query.ownersCount) : undefined,
        
        propertyType: req.query.propertyType 
          ? req.query.propertyType.split(',').map(t => t.trim()) 
          : undefined,
        listingType: req.query.listingType,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
        unitType: req.query.unitType,
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

      const result = await listingService.getAll(filters, pagination, userId, userLocation);
      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async browse(req, res) {
    try {
      const userId = req.user?.userId || null;
      const userLocation = await LocationHelper.parseUserLocation(req);
      
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
        
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
        stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId) : undefined,
        isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
        
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        
        postedByType: req.query.postedByType,
        
        search: req.query.search,
        
        sortBy: req.query.sortBy,
        
        brandId: req.query.brandId ? parseInt(req.query.brandId) : undefined,
        modelId: req.query.modelId ? parseInt(req.query.modelId) : undefined,
        variantId: req.query.variantId ? parseInt(req.query.variantId) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear) : undefined,
        condition: req.query.condition,
        fuelType: req.query.fuelType,
        transmission: req.query.transmission,
        bodyType: req.query.bodyType,
        minMileage: req.query.minKilometers ? parseInt(req.query.minKilometers) : (req.query.minMileage ? parseInt(req.query.minMileage) : undefined),
        maxMileage: req.query.maxKilometers ? parseInt(req.query.maxKilometers) : (req.query.maxMileage ? parseInt(req.query.maxMileage) : undefined),
        ownersCount: req.query.ownersCount ? parseInt(req.query.ownersCount) : undefined,
        
        propertyType: req.query.propertyType 
          ? req.query.propertyType.split(',').map(t => t.trim()) 
          : undefined,
        listingType: req.query.listingType,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
        unitType: req.query.unitType,
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

      const result = await listingService.getAll(filters, pagination, userId, userLocation);
      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const userId = req.user?.userId || null;

      const result = await listingService.getBySlug(slug, userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getByShareCode(req, res) {
    try {
      const { shareCode } = req.params;
      const userId = req.user?.userId || null;

      if (!shareCode || shareCode.trim().length === 0) {
        return validationErrorResponse(res, [{ field: 'shareCode', message: 'Share code is required' }]);
      }

      const result = await listingService.getByShareCode(shareCode, userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async searchListings(req, res) {
    try {
      console.log('=== SEARCH ENDPOINT HIT ===');
      console.log('Query params:', req.query);
      
      const {
        query,
        search, // Support both 'query' and 'search' for backward compatibility
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
        brandId,
        modelId,
        variantId,
        year,
        fuelType,
        transmission,
        condition,
        minMileage,
        maxMileage,
        propertyType,
        bedrooms,
        bathrooms,
        minArea,
        maxArea
      } = req.query;
      
      // Support both 'query' and 'search' parameter names
      const searchQuery = query || search;

      console.log('Parsed searchQuery:', searchQuery);
      console.log('Parsed sortBy:', sortBy);

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 50);

      if (pageNum < 1 || limitNum < 1) {
        console.log('Validation failed: Invalid pagination');
        return validationErrorResponse(res, [{ field: 'pagination', message: 'Invalid pagination parameters' }]);
      }

      const searchParams = {
        query: searchQuery?.trim() || null,
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
          brandId: brandId ? parseInt(brandId) : null,
          modelId: modelId ? parseInt(modelId) : null,
          variantId: variantId ? parseInt(variantId) : null,
          year: year ? parseInt(year) : null,
          fuelType,
          transmission,
          condition,
          minMileage: minMileage ? parseInt(minMileage) : null,
          maxMileage: maxMileage ? parseInt(maxMileage) : null,
          propertyType,
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          bathrooms: bathrooms ? parseInt(bathrooms) : null,
          minArea: minArea ? parseInt(minArea) : null,
          maxArea: maxArea ? parseInt(maxArea) : null
        }
      };

      console.log('Built searchParams:', JSON.stringify(searchParams, null, 2));

      const userContext = {
        userId: req.user?.userId || null,
        sessionId: req.activityData?.sessionId || 'anonymous',
        userLocation: await LocationHelper.parseUserLocation(req),
        ipAddress: req.activityData?.ipAddress,
        userAgent: req.activityData?.userAgent,
        user: req.user
      };

      console.log('Built userContext:', JSON.stringify(userContext, null, 2));

      const pagination = { page: pageNum, limit: limitNum };

      console.log('Calling listingService.searchListings...');
      const result = await listingService.searchListings(searchParams, userContext, pagination);
      console.log('Service returned:', result.success ? 'SUCCESS' : 'FAILURE');

      if (result.success) {
        return paginatedResponse(res, result.data.listings, result.data.pagination, result.message);
      } else {
        console.log('Service error message:', result.message);
        console.log('Service error details:', result.error);
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('=== CONTROLLER EXCEPTION ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      return errorResponse(res, `Failed to search listings: ${error.message}`, 500);
    }
  }

  static async getSearchSuggestions(req, res) {
    try {
      const { query, limit = 5 } = req.query;

      if (!query || query.length < 2) {
        return successResponse(res, { suggestions: [] }, 'No suggestions for short query');
      }

      const userLocation = await LocationHelper.parseUserLocation(req);
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

  static async getSearchFilters(req, res) {
    try {
      const { categoryId } = req.params;
      const userLocation = await LocationHelper.parseUserLocation(req);

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

  static async getFeatured(req, res) {
    try {
      const userId = req.user?.userId || null;
      
      const {
        categoryId,
        stateId,
        cityId,
        minPrice,
        maxPrice,
        postedByType,
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        search
      } = req.query;

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

      if (postedByType && !['owner', 'agent', 'dealer'].includes(postedByType)) {
        return errorResponse(res, 'Invalid posted by type. Must be: owner, agent, or dealer', 400);
      }

      const validSortOptions = [
        'relevance', 'date_new', 'date_old', 
        'price_low', 'price_high', 'views', 'favorites'
      ];
      
      if (sortBy && !validSortOptions.includes(sortBy)) {
        return errorResponse(res, `Invalid sort option. Must be one of: ${validSortOptions.join(', ')}`, 400);
      }

      const filters = {
        categoryId: categoryId ? parseInt(categoryId) : null,
        stateId: stateId ? parseInt(stateId) : null,
        cityId: cityId ? parseInt(cityId) : null,
        priceMin: minPrice ? parseFloat(minPrice) : null,
        priceMax: maxPrice ? parseFloat(maxPrice) : null,
        postedByType: postedByType || null,
        search: search || null,
        sortBy: sortBy || 'relevance'
      };

      const pagination = {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(parseInt(limit), 50)
      };

      const userLocation = await LocationHelper.parseUserLocation(req);

      const result = await listingService.getFeaturedListings(
        filters,
        userLocation,
        pagination,
        userId
      );

      if (result.success) {
        return paginatedResponse(res, result.data.listings, result.data.pagination, result.message);
      } else {
        return errorResponse(res, result.message, 500);
      }
    } catch (error) {
      console.error('Error in getFeatured:', error);
      return errorResponse(res, 'Failed to get featured listings', 500);
    }
  }

  static async getSimilarListings(req, res) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      const userId = req.user?.userId || null;

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

  static async incrementViewCount(req, res) {
    try {
      const { id } = req.params;
      
      const userId = req.user?.userId || null;
      const userRoleSlug = req.user?.roleSlug || null;

      const result = await listingService.incrementViewCount(parseInt(id), userId, userRoleSlug);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getRelatedListings(req, res) {
    try {
      const { id } = req.params;
      const { limit = 6 } = req.query;

      if (!id || isNaN(id)) {
        return validationErrorResponse(res, [{ field: 'id', message: 'Valid listing ID is required' }]);
      }

      const result = await listingService.getRelatedListings(parseInt(id), parseInt(limit));

      if (result.success) {
        return successResponse(res, result.data, result.message);
      } else {
        return errorResponse(res, result.message, 404);
      }
    } catch (error) {
      console.error('Error in getRelatedListings:', error);
      return errorResponse(res, 'Failed to get related listings', 500);
    }
  }
}

export default ListingController;
