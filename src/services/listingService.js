/**
 * Listing Service
 * Business logic for listing management
 */

import listingRepository from '#repositories/listingRepository.js';
import carListingRepository from '#repositories/carListingRepository.js';
import propertyListingRepository from '#repositories/propertyListingRepository.js';
import listingMediaRepository from '#repositories/listingMediaRepository.js';
import models from '#models/index.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

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

    // Check if user has auto-approve enabled
    const user = await User.findByPk(userId, { attributes: ['isAutoApproveEnabled'] });
    const isAutoApproveEnabled = user?.isAutoApproveEnabled || false;

    // Set audit fields
    listingData.userId = userId;
    listingData.createdBy = userId;
    listingData.status = 'draft';
    listingData.isAutoApproved = false;

    let quotaExceeded = false;
    let quotaMessage = null;

    // If auto-approve is enabled, check quota
    if (isAutoApproveEnabled) {
      const { canUserCreateListing } = await import('#utils/subscriptionQuotaHelper.js');
      const quotaCheck = await canUserCreateListing(userId);

      if (quotaCheck.canCreate) {
        // Quota available - set listing to active immediately
        listingData.status = 'active';
        listingData.isAutoApproved = true;
        listingData.approvedAt = new Date();
        listingData.approvedBy = userId;
        listingData.publishedAt = new Date();
        
        // Set expiry to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        listingData.expiresAt = expiresAt;
      } else {
        // Quota exceeded - create as draft instead
        quotaExceeded = true;
        quotaMessage = `${quotaCheck.message}. Your listing has been saved as draft.`;
      }
    }

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

    let message;
    if (quotaExceeded) {
      message = quotaMessage;
    } else if (isAutoApproveEnabled && completeListing.status === 'active') {
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

    // Check if user has auto-approve enabled
    const user = await User.findByPk(userId, { attributes: ['isAutoApproveEnabled'] });
    const isAutoApproveEnabled = user?.isAutoApproveEnabled || false;

    if (isAutoApproveEnabled) {
      // Check quota before auto-approving
      const { canUserCreateListing } = await import('#utils/subscriptionQuotaHelper.js');
      const quotaCheck = await canUserCreateListing(userId);

      if (quotaCheck.canCreate) {
        // Quota available - auto-approve the listing
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

        const updatedListing = await listingRepository.getById(id, { includeAll: true });

        return {
          success: true,
          message: 'Listing submitted and auto-approved successfully',
          data: updatedListing
        };
      } else {
        // Quota exceeded - submit for manual approval instead
        await listingRepository.updateStatus(id, 'pending', { userId });

        const updatedListing = await listingRepository.getById(id, { includeAll: true });

        return {
          success: true,
          message: `${quotaCheck.message}. Your listing has been submitted for manual approval.`,
          data: updatedListing
        };
      }
    }

    // Update status to pending for manual approval
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

    // Check user's subscription quota before approving
    const { canUserCreateListing } = await import('#utils/subscriptionQuotaHelper.js');
    const quotaCheck = await canUserCreateListing(listing.userId, { thirdPerson: true });

    if (!quotaCheck.canCreate) {
      return {
        success: false,
        message: quotaCheck.message,
        data: {
          listing,
          quotaDetails: quotaCheck.details
        }
      };
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
