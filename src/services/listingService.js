/**
 * Listing Service
 * Business logic for listing management
 */

import listingRepository from '#repositories/listingRepository.js';
import carListingRepository from '#repositories/carListingRepository.js';
import propertyListingRepository from '#repositories/propertyListingRepository.js';
import listingMediaRepository from '#repositories/listingMediaRepository.js';
import quotaService from '#services/quotaService.js';
import userSearchService from '#services/userSearchService.js';
import models from '#models/index.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import SearchHelper from '#utils/searchHelper.js';
import LocationHelper from '#utils/locationHelper.js';

const { User } = models;

class ListingService {
  /**
   * Validate required fields for listing
   * @param {Object} listingData - Listing data
   * @private
   */
  _validateRequiredFields(listingData) {
    if (!listingData.title || listingData.title.length < 10) {
      throw new Error('Title must be at least 10 characters');
    }



    if (!listingData.price || listingData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (!listingData.categoryId) {
      throw new Error('Category is required');
    }

    if (!listingData.stateId) {
      throw new Error('State is required');
    }

    if (!listingData.cityId) {
      throw new Error('City is required');
    }
  }

  /**
   * Create new listing
   * @param {Object} listingData - Listing data
   * @param {Object} categoryData - Category-specific data (car or property)
   * @param {number} userId - User ID creating the listing
   * @returns {Promise<Object>}
   */
  async create(listingData, categoryData, userId) {
    // Validate required fields
    this._validateRequiredFields(listingData);

    // Check listing eligibility (quota + auto-approve)
    const eligibility = await quotaService.checkListingEligibility(userId, listingData.categoryId);

    // Set audit fields
    listingData.userId = userId;
    listingData.createdBy = userId;
    listingData.status = 'draft';
    listingData.isAutoApproved = false;

    let quotaExceeded = false;
    let quotaMessage = null;

    if (!eligibility.data.canCreate) {
      // No quota available - create as draft
      quotaExceeded = true;
      quotaMessage = `${eligibility.message}. Your listing has been saved as draft.`;
    } else if (eligibility.data.hasAutoApprove) {
      // Quota available and auto-approve enabled - set to active immediately
      listingData.status = 'active';
      listingData.isAutoApproved = true;
      listingData.approvedAt = new Date();
      listingData.approvedBy = userId;
      listingData.publishedAt = new Date();
      
      // Set expiry to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      listingData.expiresAt = expiresAt;
    }

    // Create base listing
    const listing = await listingRepository.create(listingData);

    // Create category-specific data
    let categorySpecificData = null;
    if (categoryData.type === 'car') {
      await carListingRepository.create({
        listingId: listing.id,
        ...categoryData.data
      });
      categorySpecificData = categoryData.data;
    } else if (categoryData.type === 'property') {
      await propertyListingRepository.create({
        listingId: listing.id,
        ...categoryData.data
      });
      categorySpecificData = categoryData.data;
    }

    // Generate and update keywords
    await this.updateListingKeywords(listing.id, listingData, categorySpecificData);

    // Consume quota if listing was auto-approved
    if (listingData.status === 'active') {
      try {
        await quotaService.consumeQuota(userId, listingData.categoryId, listing.id);
      } catch (error) {
        console.error('Error consuming quota:', error);
        // Don't fail the listing creation if quota consumption fails
      }
    }

    // Fetch complete listing with associations
    const completeListing = await listingRepository.getById(listing.id, { includeAll: true });

    let message;
    if (quotaExceeded) {
      message = quotaMessage;
    } else if (listingData.status === 'active') {
      message = 'Listing created and auto-approved successfully';
    } else {
      message = SUCCESS_MESSAGES.LISTING_CREATED;
    }

    return {
      success: true,
      message,
      data: completeListing
    };
  }

  /**
   * Get listing by ID
   * @param {number} id - Listing ID
   * @param {number} userId - User ID (for ownership check)
   * @param {boolean} isAdmin - Is admin user
   * @returns {Promise<Object>}
   */
  async getById(id, userId = null, isAdmin = false) {
    const listing = await listingRepository.getById(id, { includeAll: true });

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Check ownership for non-admin users
    if (!isAdmin && userId && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_FETCHED,
      data: listing
    };
  }

  /**
   * Get listing by slug (public)
   * @param {string} slug - Listing slug
   * @returns {Promise<Object>}
   */
  async getBySlug(slug) {
    const listing = await listingRepository.getBySlug(slug, { includeAll: true });

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Only show active listings publicly
    if (listing.status !== 'active') {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_APPROVED);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_FETCHED,
      data: listing
    };
  }

  /**
   * Get all listings with filters
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}, pagination = {}) {
    const result = await listingRepository.getAll(filters, pagination);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTINGS_FETCHED,
      data: result.listings,
      pagination: result.pagination
    };
  }

  /**
   * Update listing
   * @param {number} id - Listing ID
   * @param {Object} updateData - Update data
   * @param {Object} categoryData - Category-specific data
   * @param {number} userId - User ID updating
   * @param {boolean} isAdmin - Is admin user
   * @returns {Promise<Object>}
   */
  async update(id, updateData, categoryData, userId, isAdmin = false) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Check ownership
    if (!isAdmin && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Check if listing can be edited
    if (!isAdmin && !['draft', 'rejected'].includes(listing.status)) {
      throw new Error(ERROR_MESSAGES.LISTING_CANNOT_EDIT);
    }

    // Validate if title or description is being updated
    if (updateData.title && updateData.title.length < 10) {
      throw new Error('Title must be at least 10 characters');
    }

    if (updateData.description && updateData.description.length < 50) {
      throw new Error('Description must be at least 50 characters');
    }

    // Update base listing
    await listingRepository.update(id, updateData, { userId });

    // Update category-specific data
    if (categoryData) {
      if (categoryData.type === 'car') {
        await carListingRepository.update(id, categoryData.data);
      } else if (categoryData.type === 'property') {
        await propertyListingRepository.update(id, categoryData.data);
      }
    }

    // Fetch updated listing
    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_UPDATED,
      data: updatedListing
    };
  }

  /**
   * Submit listing for approval
   * @param {number} id - Listing ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async submit(id, userId) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Check ownership
    if (listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // Check if listing is in draft or rejected status
    if (!['draft', 'rejected'].includes(listing.status)) {
      throw new Error(ERROR_MESSAGES.INVALID_LISTING_STATUS);
    }

    // Check if listing has at least one media
    const media = await listingMediaRepository.getByListingId(id);
    if (media.length === 0) {
      throw new Error('At least one image is required to submit listing');
    }

    // Check listing eligibility (quota + auto-approve)
    const eligibility = await quotaService.checkListingEligibility(userId, listing.categoryId);

    if (!eligibility.data.canCreate) {
      // No quota - submit for manual approval
      await listingRepository.updateStatus(id, 'pending', { userId });

      const updatedListing = await listingRepository.getById(id, { includeAll: true });

      return {
        success: true,
        message: `${eligibility.message}. Your listing has been submitted for manual approval.`,
        data: updatedListing
      };
    }

    if (eligibility.data.hasAutoApprove) {
      // Quota available and auto-approve enabled - auto-approve the listing
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await listingRepository.update(id, {
        status: 'active',
        isAutoApproved: true,
        approvedAt: new Date(),
        approvedBy: userId,
        publishedAt: new Date(),
        expiresAt
      }, { userId });

      // Consume quota
      try {
        await quotaService.consumeQuota(userId, listing.categoryId, id);
      } catch (error) {
        console.error('Error consuming quota:', error);
        // Don't fail the submission if quota consumption fails
      }

      const updatedListing = await listingRepository.getById(id, { includeAll: true });

      return {
        success: true,
        message: 'Listing submitted and auto-approved successfully',
        data: updatedListing
      };
    }

    // Quota available but no auto-approve - submit for manual approval
    await listingRepository.updateStatus(id, 'pending', { userId });

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_SUBMITTED,
      data: updatedListing
    };
  }

  /**
   * Approve listing (admin only)
   * @param {number} id - Listing ID
   * @param {number} approvedBy - User ID who approved
   * @returns {Promise<Object>}
   */
  async approve(id, approvedBy) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.status !== 'pending') {
      throw new Error('Only pending listings can be approved');
    }

    // Check user's quota availability before approving
    const quotaCheck = await quotaService.checkQuotaAvailability(listing.userId, listing.categoryId);

    if (!quotaCheck.data.hasQuota) {
      return {
        success: false,
        message: `Cannot approve listing: ${quotaCheck.message}`,
        data: {
          listing,
          quotaUsage: quotaCheck.data.quotaUsage
        }
      };
    }

    // Approve the listing
    await listingRepository.approve(id, approvedBy);

    // Consume quota after approval
    try {
      await quotaService.consumeQuota(listing.userId, listing.categoryId, id);
    } catch (error) {
      console.error('Error consuming quota after approval:', error);
      // Don't fail the approval if quota consumption fails
    }

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_APPROVED,
      data: updatedListing
    };
  }

  /**
   * Reject listing (admin only)
   * @param {number} id - Listing ID
   * @param {number} rejectedBy - User ID who rejected
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>}
   */
  async reject(id, rejectedBy, reason) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.status !== 'pending') {
      throw new Error('Only pending listings can be rejected');
    }

    if (!reason || reason.length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    await listingRepository.reject(id, rejectedBy, reason);

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_REJECTED,
      data: updatedListing
    };
  }

  /**
   * Mark listing as sold
   * @param {number} id - Listing ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async markAsSold(id, userId) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Check ownership
    if (listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (listing.status !== 'active') {
      throw new Error('Only active listings can be marked as sold');
    }

    await listingRepository.updateStatus(id, 'sold', { userId });

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_MARKED_SOLD,
      data: updatedListing
    };
  }

  /**
   * Update featured status (admin only)
   * @param {number} id - Listing ID
   * @param {boolean} isFeatured - Featured status
   * @param {number} days - Number of days to feature
   * @returns {Promise<Object>}
   */
  async updateFeaturedStatus(id, isFeatured, days = 7) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    const featuredUntil = isFeatured
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;

    await listingRepository.updateFeaturedStatus(id, isFeatured, featuredUntil);

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_FEATURED,
      data: updatedListing
    };
  }

  /**
   * Delete listing
   * @param {number} id - Listing ID
   * @param {number} userId - User ID
   * @param {boolean} isAdmin - Is admin user
   * @returns {Promise<Object>}
   */
  async delete(id, userId, isAdmin = false) {
    const listing = await listingRepository.getById(id, { includeAll: true });

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Check ownership
    if (!isAdmin && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    // CRITICAL: Delete physical files BEFORE database records
    // This prevents orphaned files in storage

    // 1. Delete all listing media files (images/videos)
    try {
      const listingMediaService = (await import('#services/listingMediaService.js')).default;
      await listingMediaService.deleteAllByListingId(id);
    } catch (error) {
      console.error(`Failed to delete listing media files: ${error.message}`);
      // Continue with deletion even if media cleanup fails
    }

    // 2. Delete all chat media files (images in conversations)
    try {
      const chatMediaService = (await import('#services/chatMediaService.js')).default;
      await chatMediaService.deleteAllByListingId(id);
    } catch (error) {
      console.error(`Failed to delete chat media files: ${error.message}`);
      // Continue with deletion even if chat media cleanup fails
    }

    // 3. Soft delete listing (CASCADE will handle related database records)
    await listingRepository.delete(id, userId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_DELETED,
      data: null
    };
  }

  /**
   * Increment view count
   * Does not increment for listing owner or super_admin
   * @param {number} id - Listing ID
   * @param {number|null} userId - User ID (if authenticated)
   * @param {string|null} userRoleSlug - User role slug (if authenticated)
   * @returns {Promise<Object>}
   */
  async incrementViewCount(id, userId = null, userRoleSlug = null) {
    // Get listing to check ownership
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Don't increment if:
    // 1. User is the listing owner
    // 2. User is super_admin (monitoring/moderation)
    const isOwner = userId && listing.userId === userId;
    const isSuperAdmin = userRoleSlug === 'super_admin';

    if (isOwner || isSuperAdmin) {
      return {
        success: true,
        message: 'View count not incremented (owner or admin)',
        data: { incremented: false, reason: isOwner ? 'owner' : 'super_admin' }
      };
    }

    // Increment view count for genuine views
    const success = await listingRepository.incrementViewCount(id);

    if (!success) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    return {
      success: true,
      message: 'View count updated',
      data: { incremented: true }
    };
  }

  /**
   * Get quota status for user in category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>}
   */
  async getQuotaStatus(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error('User ID and Category ID are required');
    }

    const quotaStatus = await quotaService.getQuotaStatus(userId, categoryId);

    return quotaStatus;
  }

  /**
   * Get all quota statuses for user (all categories)
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async getAllQuotaStatus(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const allQuotaStatus = await quotaService.getAllQuotaStatus(userId);

    return allQuotaStatus;
  }

  /**
   * Check if user can create listing in category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>}
   */
  async checkCreationEligibility(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error('User ID and Category ID are required');
    }

    const eligibility = await quotaService.checkListingEligibility(userId, categoryId);

    return eligibility;
  }

  /**
   * Search listings with advanced filtering and ranking
   * @param {Object} searchParams - Search parameters
   * @param {Object} userContext - User context (location, authentication)
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async searchListings(searchParams, userContext = {}, pagination = {}) {
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
        filters = {}
      } = searchParams;

      const { userId, sessionId, userLocation, ipAddress, userAgent } = userContext;

      // Parse user location if not provided
      const effectiveUserLocation = userLocation || LocationHelper.parseUserLocation({ 
        query: { stateId, cityId },
        user: userContext.user 
      });

      // Perform search
      const searchResult = await listingRepository.searchListings(
        searchParams,
        effectiveUserLocation,
        pagination
      );

      // Log search activity (integrate with search logging system)
      if (query || Object.keys(filters).length > 0) {
        try {
          await userSearchService.logSearch({
            userId: userId || null,
            sessionId: sessionId || 'anonymous',
            searchQuery: query || null,
            filtersApplied: {
              categoryId,
              priceMin,
              priceMax,
              stateId,
              cityId,
              locality,
              postedByType,
              featuredOnly,
              ...filters
            },
            resultsCount: searchResult.pagination.total,
            categoryId: categoryId || null,
            locationFilters: effectiveUserLocation ? {
              stateId: effectiveUserLocation.stateId,
              cityId: effectiveUserLocation.cityId
            } : {},
            priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : {},
            ipAddress,
            userAgent
          });
        } catch (error) {
          console.error('Error logging search activity:', error);
          // Don't fail search if logging fails
        }
      }

      return {
        success: true,
        message: 'Search results retrieved successfully',
        data: {
          listings: searchResult.listings,
          pagination: searchResult.pagination,
          searchMeta: {
            ...searchResult.searchMeta,
            searchTime: Date.now(), // Could be calculated properly
            appliedFilters: {
              query,
              categoryId,
              priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : null,
              location: effectiveUserLocation,
              postedByType,
              featuredOnly,
              ...filters
            }
          }
        }
      };
    } catch (error) {
      console.error('Error in searchListings:', error);
      return {
        success: false,
        message: 'Failed to search listings',
        error: error.message
      };
    }
  }

  /**
   * Get search suggestions
   * @param {string} query - Search query
   * @param {Object} userLocation - User location
   * @param {number} limit - Number of suggestions
   * @returns {Promise<Object>}
   */
  async getSearchSuggestions(query, userLocation = null, limit = 5) {
    try {
      const suggestions = await listingRepository.getSearchSuggestions(query, userLocation, limit);

      return {
        success: true,
        message: 'Search suggestions retrieved successfully',
        data: {
          suggestions,
          query: query || ''
        }
      };
    } catch (error) {
      console.error('Error in getSearchSuggestions:', error);
      return {
        success: false,
        message: 'Failed to get search suggestions',
        error: error.message
      };
    }
  }

  /**
   * Get available search filters for category
   * @param {number} categoryId - Category ID
   * @param {Object} userLocation - User location
   * @returns {Promise<Object>}
   */
  async getSearchFilters(categoryId, userLocation = null) {
    try {
      const filters = await listingRepository.getSearchFilters(categoryId, userLocation);

      return {
        success: true,
        message: 'Search filters retrieved successfully',
        data: filters
      };
    } catch (error) {
      console.error('Error in getSearchFilters:', error);
      return {
        success: false,
        message: 'Failed to get search filters',
        error: error.message
      };
    }
  }

  /**
   * Get featured listings
   * @param {Object} filters - Filter options
   * @param {Object} userLocation - User location
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getFeaturedListings(filters = {}, userLocation = null, pagination = {}) {
    try {
      const searchParams = {
        ...filters,
        featuredOnly: true,
        sortBy: 'relevance'
      };

      const result = await listingRepository.searchListings(
        searchParams,
        userLocation,
        pagination
      );

      return {
        success: true,
        message: 'Featured listings retrieved successfully',
        data: {
          listings: result.listings,
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error in getFeaturedListings:', error);
      return {
        success: false,
        message: 'Failed to get featured listings',
        error: error.message
      };
    }
  }

  /**
   * Update listing keywords (called when listing is created/updated)
   * @param {number} listingId - Listing ID
   * @param {Object} listingData - Listing data
   * @param {Object} categoryData - Category-specific data
   * @returns {Promise<boolean>}
   */
  async updateListingKeywords(listingId, listingData, categoryData = null) {
    try {
      // Generate keywords using SearchHelper
      const keywords = SearchHelper.generateKeywords(listingData, categoryData);
      
      // Update keywords in database
      await listingRepository.updateKeywords(listingId, keywords);
      
      return true;
    } catch (error) {
      console.error('Error updating listing keywords:', error);
      return false;
    }
  }

  /**
   * Get similar listings based on current listing
   * @param {number} listingId - Current listing ID
   * @param {number} limit - Number of similar listings
   * @returns {Promise<Object>}
   */
  async getSimilarListings(listingId, limit = 5) {
    try {
      const listing = await listingRepository.getById(listingId, { includeAll: true });
      
      if (!listing) {
        throw new Error('Listing not found');
      }

      // Search for similar listings
      const searchParams = {
        categoryId: listing.categoryId,
        priceMin: listing.price * 0.7, // 30% lower
        priceMax: listing.price * 1.3, // 30% higher
        stateId: listing.stateId,
        sortBy: 'relevance'
      };

      const userLocation = {
        stateId: listing.stateId,
        cityId: listing.cityId
      };

      const result = await listingRepository.searchListings(
        searchParams,
        userLocation,
        { page: 1, limit: limit + 1 } // Get one extra to exclude current listing
      );

      // Filter out the current listing
      const similarListings = result.listings.filter(l => l.id !== listingId).slice(0, limit);

      return {
        success: true,
        message: 'Similar listings retrieved successfully',
        data: {
          listings: similarListings,
          baseListing: {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            categoryId: listing.categoryId
          }
        }
      };
    } catch (error) {
      console.error('Error in getSimilarListings:', error);
      return {
        success: false,
        message: 'Failed to get similar listings',
        error: error.message
      };
    }
  }

  /**
   * Get statistics
   * @param {number} userId - User ID (optional, for user-specific stats)
   * @returns {Promise<Object>}
   */
  async getStats(userId = null) {
    const filters = userId ? { userId } : {};
    const stats = await listingRepository.getStats(filters);

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };
  }
}

// Export singleton instance
export default new ListingService();
