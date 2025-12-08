/**
 * Public Listing Controller
 * Handles public listing browsing and viewing
 */

import listingService from '#services/listingService.js';
import categoryRepository from '#repositories/categoryRepository.js';
import { successResponse, errorResponse } from '#utils/responseFormatter.js';

class ListingController {
  /**
   * Get listings for homepage (simple, no filters)
   * GET /api/public/listings/homepage
   */
  static async homepage(req, res) {
    try {
      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const filters = {
        status: 'active',
        sortBy: 'date_desc' // Newest first
      };

      const result = await listingService.getAll(filters, pagination);
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

      const result = await listingService.getAll(filters, pagination);
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
