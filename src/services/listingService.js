import listingRepository from '#repositories/listingRepository.js';
import carListingRepository from '#repositories/carListingRepository.js';
import propertyListingRepository from '#repositories/propertyListingRepository.js';
import listingMediaRepository from '#repositories/listingMediaRepository.js';
import categoryRepository from '#repositories/categoryRepository.js';
import quotaService from '#services/quotaService.js';
import userSearchService from '#services/userSearchService.js';
import notificationHelperService from '#services/notificationHelperService.js';
import locationService from '#services/locationService.js';
import models from '#models/index.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import SearchHelper from '#utils/searchHelper.js';
import LocationHelper from '#utils/locationHelper.js';
import { generateShareCode } from '#utils/customSlugify.js';
import scoringLogger from '#utils/loggers/scoringLogger.js';

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

    if (!listingData.locationData && !listingData.stateId) {
      throw new Error('Location data or state is required');
    }

    if (!listingData.locationData && !listingData.cityId) {
      throw new Error('Location data or city is required');
    }
  }

  async create(listingData, categoryData, userId) {
    console.log(`[LISTING CREATE] ========== START ==========`);
    console.log(`[LISTING CREATE] userId=${userId}, categoryId=${listingData.categoryId}`);
    
    this._validateRequiredFields(listingData);

    const category = await categoryRepository.getById(listingData.categoryId);
    if (!category) {
      throw new Error('Invalid category');
    }

    if (listingData.locationData) {
      const location = await locationService.cacheLocation(
        listingData.locationData,
        userId
      );
      
      listingData.locationId = location.id;
      listingData.latitude = location.latitude;
      listingData.longitude = location.longitude;
      listingData.stateName = location.state;
      listingData.cityName = location.city;
      
      listingData.address = listingData.locationData.address;
      listingData.locality = location.formattedAddress || listingData.locationData.locality;
      listingData.pincode = listingData.locationData.pincode || location.pincode;
      
      if (location.matchedStateId) {
        listingData.stateId = location.matchedStateId;
      }
      if (location.matchedCityId) {
        listingData.cityId = location.matchedCityId;
      }
    }

    listingData.userId = userId;
    listingData.categorySlug = category.slug;
    listingData.createdBy = userId;
    listingData.status = 'draft';
    listingData.isAutoApproved = false;

    console.log(`[LISTING CREATE] Creating listing as draft`);
    const listing = await listingRepository.create(listingData);
    console.log(`[LISTING CREATE] Listing created with ID=${listing.id}`);

    this._generateAndSetShareCode(listing.id);

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

    const completeListing = await listingRepository.getById(listing.id, { includeAll: true });

    console.log(`[LISTING CREATE] ========== END (Listing saved as draft) ==========`);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_CREATED,
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

  async getByShareCode(shareCode, userId = null) {
    if (!shareCode || shareCode.trim().length === 0) {
      throw new Error('Share code is required');
    }

    const listing = await listingRepository.findByShareCode(shareCode.trim());

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.status !== 'active') {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_APPROVED);
    }

    const completeListing = await listingRepository.getById(listing.id, { includeAll: true }, userId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_FETCHED,
      data: completeListing
    };
  }

  async getAllForAdmin(filters = {}, pagination = {}) {
    const result = await listingRepository.getAllForAdmin(filters, pagination);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTINGS_FETCHED,
      data: result.listings,
      pagination: result.pagination
    };
  }

  async getAll(filters = {}, pagination = {}, userId = null, userLocation = null) {
    const hasCoordinates = !!(userLocation?.latitude && userLocation?.longitude);
    
    if (hasCoordinates) {
      const result = await listingRepository.findListingsByDistance(
        userLocation,
        filters,
        pagination,
        userId
      );
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.LISTINGS_FETCHED,
        data: result.listings,
        pagination: result.pagination
      };
    } else {
      const result = await listingRepository.getAll(filters, pagination, userId, null);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.LISTINGS_FETCHED,
        data: result.listings,
        pagination: result.pagination
      };
    }
  }

  async update(id, updateData, categoryData, userId, isAdmin = false) {
    const listing = await listingRepository.getById(id, { includeAll: true });

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (!isAdmin && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!isAdmin && !['draft', 'rejected'].includes(listing.status)) {
      throw new Error('Only draft or rejected listings can be updated');
    }

    if (updateData.categoryId !== undefined) {
      throw new Error('Category cannot be changed after creation');
    }

    if (updateData.shareCode !== undefined) {
      throw new Error('Share code cannot be modified');
    }

    if (updateData.title && updateData.title.length < 10) {
      throw new Error('Title must be at least 10 characters');
    }

    if (updateData.price !== undefined && updateData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (updateData.locationData) {
      const location = await locationService.cacheLocation(
        updateData.locationData,
        userId
      );
      
      updateData.locationId = location.id;
      updateData.latitude = location.latitude;
      updateData.longitude = location.longitude;
      updateData.stateName = location.state;
      updateData.cityName = location.city;
      updateData.address = updateData.locationData.address || location.formattedAddress;
      updateData.locality = updateData.locationData.locality || location.locality;
      updateData.pincode = updateData.locationData.pincode || location.pincode;
      
      if (location.matchedStateId) {
        updateData.stateId = location.matchedStateId;
      }
      if (location.matchedCityId) {
        updateData.cityId = location.matchedCityId;
      }
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

    let categorySpecificData = null;
    if (updatedListing.carListing) {
      categorySpecificData = updatedListing.carListing.toJSON();
    } else if (updatedListing.propertyListing) {
      categorySpecificData = updatedListing.propertyListing.toJSON();
    }
    
    await this.updateListingKeywords(id, updatedListing.toJSON(), categorySpecificData);

    const completeListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_UPDATED,
      data: completeListing
    };
  }

  async submit(id, userId) {
    console.log(`[LISTING SUBMIT] ========== START ==========`);
    console.log(`[LISTING SUBMIT] listingId=${id}, userId=${userId}`);
    
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    console.log(`[LISTING SUBMIT] Listing found: categoryId=${listing.categoryId}, status=${listing.status}`);

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

    console.log(`[LISTING SUBMIT] Checking eligibility...`);
    const eligibility = await quotaService.checkListingEligibility(userId, listing.categoryId);
    console.log(`[LISTING SUBMIT] Eligibility result:`, JSON.stringify(eligibility, null, 2));

    if (!eligibility.data.canCreate) {
      console.log(`[LISTING SUBMIT] QUOTA EXCEEDED - Keeping as draft`);
      // Keep as draft when quota is exhausted
      await listingRepository.updateStatus(id, 'draft', { userId });

      const updatedListing = await listingRepository.getById(id, { includeAll: true });

      console.log(`[LISTING SUBMIT] ========== END (QUOTA EXCEEDED) ==========`);
      return {
        success: true,
        message: `${eligibility.message}. Your listing has been saved as draft.`,
        data: updatedListing,
        quotaExceeded: true
      };
    }

    if (eligibility.data.hasAutoApprove) {
      console.log(`[LISTING SUBMIT] AUTO-APPROVE - Setting status to active`);
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

      console.log(`[LISTING SUBMIT] Consuming quota...`);
      try {
        await quotaService.consumeQuota(userId, listing.categoryId, id);
        console.log(`[LISTING SUBMIT] Quota consumed successfully`);
      } catch (error) {
        console.error(`[LISTING SUBMIT] ERROR consuming quota:`, error.message);
      }

      const updatedListing = await listingRepository.getById(id, { includeAll: true });

      console.log(`[LISTING SUBMIT] ========== END (AUTO-APPROVED) ==========`);
      return {
        success: true,
        message: 'Listing submitted and auto-approved successfully',
        data: updatedListing,
        quotaExceeded: false
      };
    }

    console.log(`[LISTING SUBMIT] NO AUTO-APPROVE - Setting status to pending`);
    await listingRepository.updateStatus(id, 'pending', { userId });

    console.log(`[LISTING SUBMIT] Reserving quota for pending listing...`);
    try {
      await quotaService.consumeQuota(userId, listing.categoryId, id);
      console.log(`[LISTING SUBMIT] Quota reserved successfully`);
    } catch (error) {
      console.error(`[LISTING SUBMIT] ERROR reserving quota:`, error.message);
    }

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    console.log(`[LISTING SUBMIT] ========== END (PENDING) ==========`);
    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_SUBMITTED,
      data: updatedListing,
      quotaExceeded: false
    };
  }

  async approve(id, approvedBy) {
    console.log(`[APPROVE] Starting approval for listing ID=${id}, approvedBy=${approvedBy}`);
    
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    console.log(`[APPROVE] Listing found: userId=${listing.userId}, categoryId=${listing.categoryId}, status=${listing.status}`);

    if (listing.status !== 'pending') {
      throw new Error('Only pending listings can be approved');
    }

    console.log(`[APPROVE] Approving listing (pending listings reserve quota, so no additional check needed)`);
    await listingRepository.approve(id, approvedBy);

    try {
      await quotaService.consumeQuota(listing.userId, listing.categoryId, id);
    } catch (error) {
      console.error(`[APPROVE] Error consuming quota (non-blocking):`, error.message);
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

    console.log(`[APPROVE] Approval completed successfully`);
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

  async makeFeatured(id, userId) {
    const listing = await listingRepository.getById(id, { includeAll: true });

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (listing.status !== 'active') {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_ACTIVE);
    }

    if (listing.isFeatured) {
      throw new Error(ERROR_MESSAGES.LISTING_ALREADY_FEATURED);
    }

    const { UserSubscription, SubscriptionPlan } = models;
    
    const activeSubscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          where: { categoryId: listing.categoryId },
          required: true
        }
      ]
    });

    if (!activeSubscription) {
      throw new Error(ERROR_MESSAGES.NO_ACTIVE_SUBSCRIPTION);
    }

    const currentFeaturedCount = await listingRepository.countFeaturedByUserAndCategory(
      userId,
      listing.categoryId
    );

    if (currentFeaturedCount >= activeSubscription.maxFeaturedListings) {
      throw new Error(ERROR_MESSAGES.FEATURED_QUOTA_EXCEEDED);
    }

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + activeSubscription.featuredDays);

    await listingRepository.update(id, {
      isFeatured: true,
      featuredUntil
    }, { userId });

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_MADE_FEATURED,
      data: updatedListing
    };
  }

  async removeFeatured(id, userId) {
    const listing = await listingRepository.getById(id, { includeAll: true });

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    if (listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!listing.isFeatured) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FEATURED);
    }

    await listingRepository.update(id, {
      isFeatured: false,
      featuredUntil: null
    }, { userId });

    const updatedListing = await listingRepository.getById(id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_REMOVED_FROM_FEATURED,
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
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timer = scoringLogger.startTimer();
    
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

      const hasCoordinates = !!(userLocation?.latitude && userLocation?.longitude);
      
      scoringLogger.searchInitiated(requestId, {
        userId,
        categoryId,
        sortBy,
        hasCoordinates,
        userLocation: hasCoordinates ? { 
          lat: userLocation.latitude, 
          lng: userLocation.longitude,
          source: userLocation.source 
        } : null,
        priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : null
      });

      let searchResult;

      if (hasCoordinates) {
        scoringLogger.searchMethodSelected(requestId, {
          method: 'bounding_box',
          reason: 'User has coordinates',
          source: userLocation.source
        });
        
        const fallbackFilters = {
          categoryId,
          priceMin,
          priceMax,
          sortBy,
          requestId,
          ...filters
        };

        searchResult = await listingRepository.findListingsByDistance(
          userLocation,
          fallbackFilters,
          pagination,
          userId
        );

        searchResult.searchMeta = {
          query: query || '',
          totalResults: searchResult.pagination.total,
          userLocation: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            source: userLocation.source
          }
        };
      } else {
        scoringLogger.searchMethodSelected(requestId, {
          method: 'standard_search',
          reason: 'No coordinates available'
        });
        
        searchResult = await listingRepository.searchListings(
          searchParams,
          userLocation,
          pagination,
          userId
        );
      }

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
            locationFilters: hasCoordinates ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            } : {},
            priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : {},
            ipAddress,
            userAgent
          });
        } catch (error) {
          scoringLogger.warn('Failed to log search activity', { requestId, error: error.message });
        }
      }

      timer.done({
        message: 'Search completed',
        requestId,
        resultsCount: searchResult.listings?.length || 0,
        totalResults: searchResult.pagination.total,
        method: hasCoordinates ? 'bounding_box' : 'standard_search'
      });

      scoringLogger.searchCompleted(requestId, {
        resultsCount: searchResult.listings?.length || 0,
        totalResults: searchResult.pagination.total,
        method: hasCoordinates ? 'bounding_box' : 'standard_search'
      });

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
              location: hasCoordinates ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                source: userLocation.source
              } : null,
              postedByType,
              featuredOnly,
              ...filters
            }
          }
        }
      };
    } catch (error) {
      scoringLogger.error('Search failed', {
        requestId,
        error: error.message,
        stack: error.stack
      });
      
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
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const hasCoordinates = !!(filters.userLocation?.latitude && filters.userLocation?.longitude);
      
      scoringLogger.info('Homepage listings requested', {
        requestId,
        categories: filters.categories,
        limit: filters.limit,
        featuredLimit: filters.featuredLimit,
        hasCoordinates,
        source: filters.userLocation?.source || 'none'
      });

      const result = await listingRepository.getHomepageListings({ ...filters, requestId });

      scoringLogger.info('Homepage listings retrieved', {
        requestId,
        featuredCount: result.featured?.length || 0,
        categoriesCount: Object.keys(result.byCategory || {}).length
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.LISTINGS_RETRIEVED,
        data: result
      };
    } catch (error) {
      scoringLogger.error('Homepage listings failed', {
        requestId,
        error: error.message
      });
      
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
        featuredOnly: true
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
      if (!listingId || isNaN(listingId)) {
        throw new Error('Valid listing ID is required');
      }

      const validLimit = Math.min(Math.max(parseInt(limit), 1), 12);

      const listing = await listingRepository.getById(listingId);
      if (!listing) {
        throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
      }

      const relatedListings = await listingRepository.findRelatedListings(listingId, validLimit);

      return {
        success: true,
        message: 'Related listings retrieved successfully',
        data: {
          listings: relatedListings,
          count: relatedListings.length
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

  _generateAndSetShareCode(listingId) {
    setImmediate(async () => {
      try {
        let shareCode;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 10;

        while (exists && attempts < maxAttempts) {
          shareCode = generateShareCode(7);
          const existingListing = await listingRepository.findByShareCode(shareCode);
          exists = !!existingListing;
          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.error(`Failed to generate unique share code for listing ${listingId} after ${maxAttempts} attempts`);
          return;
        }

        await listingRepository.updateShareCode(listingId, shareCode);
        console.log(`Share code ${shareCode} generated for listing ${listingId}`);
      } catch (error) {
        console.error(`Failed to generate share code for listing ${listingId}:`, error.message);
      }
    });
  }

  _getCategoryTypeFromSlug(slug) {
    if (!slug) return null;
    
    const normalizedSlug = slug.toLowerCase().trim();
    
    if (normalizedSlug === 'cars' || normalizedSlug === 'car') return 'car';
    if (normalizedSlug === 'properties' || normalizedSlug === 'property') return 'property';
    
    return null;
  }

  async cacheOLALocation(olaResponse, userId = null) {
    try {
      const parsed = LocationHelper.parseOLALocation(olaResponse);
      if (!parsed) {
        throw new Error('Failed to parse OLA location response');
      }

      const matched = await LocationHelper.matchLocationToDatabase(
        parsed.city,
        parsed.state
      );

      const { default: models } = await import('#models/index.js');
      const { Location } = models;

      const existing = await Location.findOne({
        where: {
          provider: 'ola_maps',
          externalId: parsed.placeId
        }
      });

      if (existing) {
        await existing.increment('usageCount');
        await existing.update({ lastUsedAt: new Date() });
        return existing.id;
      }

      const location = await Location.create({
        provider: 'ola_maps',
        externalId: parsed.placeId,
        placeId: parsed.placeId,
        reference: parsed.reference,
        name: parsed.placeName || parsed.city || 'Unknown Location',
        type: 'place',
        country: 'India',
        state: parsed.state,
        city: parsed.city,
        locality: parsed.locality,
        pincode: parsed.pincode,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        formattedAddress: parsed.formattedAddress,
        matchedStateId: matched.stateId,
        matchedCityId: matched.cityId,
        matchConfidence: matched.confidence,
        rawResponse: olaResponse,
        usageCount: 1,
        lastUsedAt: new Date(),
        createdBy: userId
      });

      return location.id;
    } catch (error) {
      console.error('Error caching OLA location:', error);
      throw error;
    }
  }

  async cacheGoogleLocation(googleResponse, userId = null) {
    try {
      const parsed = LocationHelper.parseGoogleLocation(googleResponse);
      if (!parsed) {
        throw new Error('Failed to parse Google location response');
      }

      const matched = await LocationHelper.matchLocationToDatabase(
        parsed.city,
        parsed.state
      );

      const { default: models } = await import('#models/index.js');
      const { Location } = models;

      const existing = await Location.findOne({
        where: {
          provider: 'google',
          externalId: parsed.externalId
        }
      });

      if (existing) {
        await existing.increment('usageCount');
        await existing.update({ lastUsedAt: new Date() });
        return existing.id;
      }

      const location = await Location.create({
        provider: 'google',
        externalId: parsed.externalId,
        providerNumericId: parsed.providerNumericId,
        parentId: parsed.parentId,
        name: parsed.name || parsed.city || 'Unknown Location',
        type: parsed.type || 'place',
        country: parsed.country || 'India',
        state: parsed.state,
        district: parsed.district,
        city: parsed.city,
        locality: parsed.locality,
        pincode: parsed.pincode,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        formattedAddress: parsed.formattedAddress,
        addressComponents: googleResponse.addressComponents || null,
        matchedStateId: matched.stateId,
        matchedCityId: matched.cityId,
        matchConfidence: matched.confidence,
        rawResponse: googleResponse,
        usageCount: 1,
        lastUsedAt: new Date(),
        createdBy: userId
      });

      return location.id;
    } catch (error) {
      console.error('Error caching Google location:', error);
      throw error;
    }
  }

  async updateListingLocation(listingId, locationData, userId = null) {
    try {
      let locationId = null;

      if (locationData.olaLocation) {
        locationId = await this.cacheOLALocation(locationData.olaLocation, userId);
      } else if (locationData.googleLocation) {
        locationId = await this.cacheGoogleLocation(locationData.googleLocation, userId);
      }

      const updateData = {
        locationId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        stateName: locationData.stateName,
        cityName: locationData.cityName,
        locality: locationData.locality,
        pincode: locationData.pincode,
        address: locationData.address
      };

      if (locationData.stateId) updateData.stateId = locationData.stateId;
      if (locationData.cityId) updateData.cityId = locationData.cityId;

      return await listingRepository.update(listingId, updateData, { userId });
    } catch (error) {
      console.error('Error updating listing location:', error);
      throw error;
    }
  }
}


export default new ListingService();
