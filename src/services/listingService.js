/**
 * Listing Service
 * Business logic for listing management
 */

import listingRepository from '#repositories/listingRepository.js';
import carListingRepository from '#repositories/carListingRepository.js';
import propertyListingRepository from '#repositories/propertyListingRepository.js';
import listingMediaRepository from '#repositories/listingMediaRepository.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

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

    // Set audit fields
    listingData.userId = userId;
    listingData.createdBy = userId;
    listingData.status = 'draft';

    // Create base listing
    const listing = await listingRepository.create(listingData);

    // Create category-specific data
    if (categoryData.type === 'car') {
      await carListingRepository.create({
        listingId: listing.id,
        ...categoryData.data
      });
    } else if (categoryData.type === 'property') {
      await propertyListingRepository.create({
        listingId: listing.id,
        ...categoryData.data
      });
    }

    // Fetch complete listing with associations
    const completeListing = await listingRepository.getById(listing.id, { includeAll: true });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_CREATED,
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

    // Update status to pending
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

    await listingRepository.approve(id, approvedBy);

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
    const listing = await listingRepository.getById(id);

    if (!listing) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Check ownership
    if (!isAdmin && listing.userId !== userId) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    await listingRepository.delete(id, userId);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LISTING_DELETED,
      data: null
    };
  }

  /**
   * Increment view count
   * @param {number} id - Listing ID
   * @returns {Promise<Object>}
   */
  async incrementViewCount(id) {
    const success = await listingRepository.incrementViewCount(id);

    if (!success) {
      throw new Error(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    return {
      success: true,
      message: 'View count updated',
      data: null
    };
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
