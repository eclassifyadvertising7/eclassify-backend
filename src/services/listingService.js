import listingRepository from '#repositories/listingRepository.js';
import carListingRepository from '#repositories/carListingRepository.js';
import propertyListingRepository from '#repositories/propertyListingRepository.js';
import listingMediaRepository from '#repositories/listingMediaRepository.js';
import quotaService from '#services/quotaService.js';
import userSearchService from '#services/userSearchService.js';
import notificationHelperService from '#services/notificationHelperService.js';
import models from '#models/index.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import SearchHelper from '#utils/searchHelper.js';
import LocationHelper from '#utils/locationHelper.js';
import { generateShareCode } from '#utils/customSlugify.js';

const { User } = models;

class ListingService {
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

  async create(listingData, categoryData, userId) {
    this._validateRequiredFields(listingData);

    const eligibility = await quotaService.checkListingEligibility(userId, listingData.categoryId);

    listingData.userId = userId;
    listingData.createdBy = userId;
    listingData.status = 'draft';
    listingData.isAutoApproved = false;

    let quotaExceeded = false;
    let quotaMessage = null;

    if (!eligibility.data.canCreate) {
      quotaExceeded = true;
      quotaMessage = `${eligibility.message}. Your listing has been saved as draft.`;
    } else if (eligibility.data.hasAutoApprove) {
      listingData.status = 'active';
      listingData.isAutoApproved = true;
      listingData.approvedAt = new Date();
      listingData.approvedBy = userId;
      listingData.publishedAt = new Date();
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      listingData.expiresAt = expiresAt;
    }

    const listing = await listingRepository.create(listingData);

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

    await this.updateListingKeywords(listing.id, listingData, categorySpecificData);

    if (listingData.status === 'active') {
      try {
        await quotaService.consumeQuota(userId, listingData.categoryId, listing.id);
      } catch (error) {
      }
    }

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

  async getById(id, userId = null, isAdmin = false) {
    const listing = await listingRepository.getById(id, { includeAll: true }, userId);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (!isAdmin && userId && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_FETCHED,
      data: listing
    };
  }

  async getBySlug(slug, userId = null) {
    const listing = await listingRepository.getBySlug(slug, { includeAll: true }, userId);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.status !== 'active') {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_APPROVED);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_FETCHED,
      data: listing
    };
  }

  async getAll(filters = {}, pagination = {}, userId = null) {
    const result = await listingRepository.getAll(filters, pagination, userId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTINGS_FETCHED,
      data: result.listings,
      pagination: result.pagination
    };
  }

  async update(id, updateData, categoryData, userId, isAdmin = false) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (!isAdmin && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!isAdmin && !['draft', 'rejected'].includes(listing.status)) {
      throw new Error(ERROR_MESSAGES.LISTING_CANNOT_EDIT);
    }

    if (updateData.title && updateData.title.length < 10) {
      throw new Error('Title must be at least 10 characters');
    }

    if (updateData.description && updateData.description.length < 50) {
      throw new Error('Description must be at least 50 characters');
    }

    await listingRepository.update(id, updateData, { userId });

    if (categoryData) {
      if (categoryData.type === 'car') {
        await carListingRepository.update(id, categoryData.data);
      } else if (categoryData.type === 'property') {
        await propertyListingRepository.update(id, categoryData.data);
      }
    }

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_UPDATED,
      data: updatedListing
    };
  }

  async submit(id, userId) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!['draft', 'rejected'].includes(listing.status)) {
      throw new Error(ERROR_MESSAGES.INVALID_LISTING_STATUS);
    }

    const media = await listingMediaRepository.getByListingId(id);
    if (media.length === 0) {
      throw new Error('At least one image is required to submit listing');
    }

    const eligibility = await quotaService.checkListingEligibility(userId, listing.categoryId);

    if (!eligibility.data.canCreate) {
      await listingRepository.updateStatus(id, 'pending', { userId });

      const updatedListing = await listingRepository.getById(id, { includeAll: true });

      return {
        success: true,
        message: `${eligibility.message}. Your listing has been submitted for manual approval.`,
        data: updatedListing
      };
    }

    if (eligibility.data.hasAutoApprove) {
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

      try {
        await quotaService.consumeQuota(userId, listing.categoryId, id);
      } catch (error) {
      }

      const updatedListing = await listingRepository.getById(id, { includeAll: true });

      return {
        success: true,
        message: 'Listing submitted and auto-approved successfully',
        data: updatedListing
      };
    }

    await listingRepository.updateStatus(id, 'pending', { userId });

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_SUBMITTED,
      data: updatedListing
    };
  }

  async approve(id, approvedBy) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.status !== 'pending') {
      throw new Error('Only pending listings can be approved');
    }

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

    await listingRepository.approve(id, approvedBy);

    try {
      await quotaService.consumeQuota(listing.userId, listing.categoryId, id);
    } catch (error) {
    }

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    try {
      await notificationHelperService.notifyListingApproved(
        listing.userId,
        {
          id: updatedListing.id,
          title: updatedListing.title,
          slug: updatedListing.slug,
          expiresAt: updatedListing.expiresAt
        },
        approvedBy
      );
    } catch (error) {
      console.error('Failed to send listing approval notification:', error);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_APPROVED,
      data: updatedListing
    };
  }

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

    try {
      await notificationHelperService.notifyListingRejected(
        listing.userId,
        {
          id: updatedListing.id,
          title: updatedListing.title,
          slug: updatedListing.slug
        },
        rejectedBy,
        reason
      );
    } catch (error) {
      console.error('Failed to send listing rejection notification:', error);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_REJECTED,
      data: updatedListing
    };
  }

  async markAsSold(id, userId) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

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

  async delete(id, userId, isAdmin = false) {
    const listing = await listingRepository.getById(id, { includeAll: true });

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (!isAdmin && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    try {
      const listingMediaService = (await import('#services/listingMediaService.js')).default;
      await listingMediaService.deleteAllByListingId(id);
    } catch (error) {
    }

    try {
      const chatMediaService = (await import('#services/chatMediaService.js')).default;
      await chatMediaService.deleteAllByListingId(id);
    } catch (error) {
    }

    await listingRepository.delete(id, userId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_DELETED,
      data: null
    };
  }

  async incrementViewCount(id, userId = null, userRoleSlug = null) {
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    const isOwner = userId && listing.userId === userId;
    const isSuperAdmin = userRoleSlug === 'super_admin';

    if (isOwner || isSuperAdmin) {
      return {
        success: true,
        message: 'View count not incremented (owner or admin)',
        data: { incremented: false, reason: isOwner ? 'owner' : 'super_admin' }
      };
    }

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

  async getQuotaStatus(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error('User ID and Category ID are required');
    }

    const quotaStatus = await quotaService.getQuotaStatus(userId, categoryId);

    return quotaStatus;
  }

  async getAllQuotaStatus(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const allQuotaStatus = await quotaService.getAllQuotaStatus(userId);

    return allQuotaStatus;
  }

  async checkCreationEligibility(userId, categoryId) {
    if (!userId || !categoryId) {
      throw new Error('User ID and Category ID are required');
    }

    const eligibility = await quotaService.checkListingEligibility(userId, categoryId);

    return eligibility;
  }

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

      const effectiveUserLocation = userLocation || LocationHelper.parseUserLocation({ 
        query: { stateId, cityId },
        user: userContext.user 
      });

      const searchResult = await listingRepository.searchListings(
        searchParams,
        effectiveUserLocation,
        pagination,
        userId
      );

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
            searchTime: Date.now(),
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
      return {
        success: false,
        message: 'Failed to search listings',
        error: error.message
      };
    }
  }

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
      return {
        success: false,
        message: 'Failed to get search suggestions',
        error: error.message
      };
    }
  }

  async getSearchFilters(categoryId, userLocation = null) {
    try {
      const filters = await listingRepository.getSearchFilters(categoryId, userLocation);

      return {
        success: true,
        message: 'Search filters retrieved successfully',
        data: filters
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get search filters',
        error: error.message
      };
    }
  }

  async getHomepageListings(filters = {}) {
    try {
      const result = await listingRepository.getHomepageListings(filters);

      return {
        success: true,
        message: SUCCESS_MESSAGES.LISTINGS_RETRIEVED,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.LISTINGS_FETCH_FAILED,
        error: error.message
      };
    }
  }

  async getFeaturedListings(filters = {}, userLocation = null, pagination = {}, userId = null) {
    try {
      const searchParams = {
        ...filters,
        featuredOnly: true,
        sortBy: 'relevance'
      };

      const result = await listingRepository.searchListings(
        searchParams,
        userLocation,
        pagination,
        userId
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
      return {
        success: false,
        message: 'Failed to get featured listings',
        error: error.message
      };
    }
  }

  async updateListingKeywords(listingId, listingData, categoryData = null) {
    try {
      const keywords = SearchHelper.generateKeywords(listingData, categoryData);
      await listingRepository.updateKeywords(listingId, keywords);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSimilarListings(listingId, limit = 5, userId = null) {
    try {
      const listing = await listingRepository.getById(listingId, { includeAll: true });
      
      if (!listing) {
        throw new Error('Listing not found');
      }

      const searchParams = {
        categoryId: listing.categoryId,
        priceMin: listing.price * 0.7,
        priceMax: listing.price * 1.3,
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
        { page: 1, limit: limit + 1 },
        userId
      );

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
      return {
        success: false,
        message: 'Failed to get similar listings',
        error: error.message
      };
    }
  }

  async getStats(userId = null) {
    const filters = userId ? { userId } : {};
    const stats = await listingRepository.getStats(filters);

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };
  }

  async getRelatedListings(listingId, limit = 6) {
    try {
      // Validate listing ID
      if (!listingId || isNaN(listingId)) {
        throw new Error('Valid listing ID is required');
      }

      // Validate limit
      const validLimit = Math.min(Math.max(parseInt(limit), 1), 12);

      // Check if listing exists
      const listing = await listingRepository.getById(listingId);
      if (!listing) {
        throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
      }

      // Get related listings
      const relatedListings = await listingRepository.findRelatedListings(listingId, validLimit);

      // Format response
      const formattedListings = relatedListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        location: `${listing.city_name}, ${listing.state_name}`,
        thumbnailUrl: listing.thumbnail_url,
        storageType: listing.storage_type,
        thumbnailMimeType: listing.thumbnail_mime_type,
        createdAt: listing.created_at,
        categoryName: listing.category_name
      }));

      return {
        success: true,
        message: 'Related listings retrieved successfully',
        data: {
          listings: formattedListings,
          count: formattedListings.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get related listings',
        data: {
          listings: [],
          count: 0
        }
      };
    }
  }
}


export default new ListingService();
