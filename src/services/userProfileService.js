import profileRepository from '#repositories/profileRepository.js';
import listingRepository from '#repositories/listingRepository.js';
import categoryRepository from '#repositories/categoryRepository.js';

class UserProfileService {
  /**
   * Get user's public profile with category statistics and recent listings
   * @param {number} userId 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getUserPublicProfile(userId, options = {}) {
    const { listingsPerCategory = 3 } = options;

    if (!userId || isNaN(userId)) {
      throw new Error('condition result is = '+isNaN(userId)+' User Id is = '+userId);
    }

    // Get user basic info from repository
    const user = await profileRepository.getUserPublicInfo(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Convert to plain object to access aliased fields
    const userData = user.toJSON();

    // Get total listings count from repository
    const totalListings = await listingRepository.getUserTotalListingsCount(userId);

    // Get category stats with listings using optimized approach
    const categoryStats = await this._getCategoryStatsWithListings(userId, listingsPerCategory);

    return {
      user: {
        id: userData.id,
        name: userData.fullName || 'Anonymous User',
        joinedDate: userData.createdAt,
        isVerified: userData.isVerified,
        cityName: userData.profile?.cityName || null,
        stateName: userData.profile?.stateName || null,
        profilePhoto: userData.profile?.profilePhoto || null,
        totalListings
      },
      categoryStats
    };
  }

  /**
   * Get user's listings for a specific category with pagination
   * @param {number} userId 
   * @param {number} categoryId 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getUserCategoryListings(userId, categoryId, options = {}) {
    const { page = 1, limit = 20, status = 'all' } = options;

    if (!userId || isNaN(userId) || !categoryId || isNaN(categoryId)) {
      throw new Error('Invalid user ID or category ID');
    }

    // Get user and category info from repositories
    const [user, category] = await Promise.all([
      profileRepository.getUserPublicInfo(userId),
      categoryRepository.getBasicInfo(categoryId)
    ]);

    if (!user || !category) {
      throw new Error('User or category not found');
    }

    // Get listings with pagination from repository
    const { count, rows: listings } = await listingRepository.getUserCategoryListings(
      userId, 
      categoryId, 
      { page, limit, status }
    );

    // Get stats using optimized single-query approach
    const stats = await listingRepository.getUserCategoryStats(userId, categoryId);

    return {
      user: {
        id: user.id,
        name: user.fullName || 'Anonymous User'
      },
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      },
      stats,
      listings: this._formatListings(listings),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  /**
   * Get category statistics with recent listings (private method)
   * @param {number} userId 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async _getCategoryStatsWithListings(userId, limit) {
    // Get categories that have listings for this user
    const categoriesWithListings = await listingRepository.getUserCategoriesWithListings(userId);

    const categoryStats = [];

    for (const category of categoriesWithListings) {
      // Get stats using optimized single-query approach
      const stats = await listingRepository.getUserCategoryStats(userId, category.id);
      
      // Only include categories that have listings
      if (stats.total > 0) {
        // Get recent listings for this category
        const recentListings = await listingRepository.getUserCategoryRecentListings(
          userId, 
          category.id, 
          limit
        );

        categoryStats.push({
          categoryId: category.id,
          categoryName: category.name,
          categorySlug: category.slug,
          ...stats,
          recentListings: this._formatListings(recentListings)
        });
      }
    }

    // Sort by total listings count (descending)
    return categoryStats.sort((a, b) => b.total - a.total);
  }

  /**
   * Format listings data for response (private method)
   * @param {Array} listings 
   * @returns {Array}
   */
  _formatListings(listings) {
    return listings.map(listing => ({
      id: listing.id.toString(),
      userId: listing.userId.toString(),
      categoryId: listing.categoryId,
      categorySlug: listing.categorySlug,
      title: listing.title,
      slug: listing.slug,
      shareCode: listing.shareCode,
      description: listing.description,
      price: listing.price,
      priceNegotiable: listing.priceNegotiable,
      stateId: listing.stateId,
      cityId: listing.cityId,
      stateName: listing.stateName,
      cityName: listing.cityName,
      locality: listing.locality,
      pincode: listing.pincode,
      address: listing.address,
      latitude: listing.latitude,
      longitude: listing.longitude,
      status: listing.status,
      isFeatured: listing.isFeatured,
      featuredUntil: listing.featuredUntil,
      expiresAt: listing.expiresAt,
      publishedAt: listing.publishedAt,
      approvedAt: listing.approvedAt,
      approvedBy: listing.approvedBy?.toString(),
      rejectedAt: listing.rejectedAt,
      rejectedBy: listing.rejectedBy?.toString(),
      rejectionReason: listing.rejectionReason,
      viewCount: listing.viewCount,
      contactCount: listing.contactCount,
      totalFavorites: listing.totalFavorites,
      coverImage: listing.coverImage,
      coverImageStorageType: listing.coverImageStorageType,
      coverImageMimeType: listing.coverImageMimeType,
      isAutoApproved: listing.isAutoApproved,
      postedByType: listing.postedByType,
      userSubscriptionId: listing.userSubscriptionId?.toString(),
      isPaidListing: listing.isPaidListing,
      createdBy: listing.createdBy?.toString(),
      updatedBy: listing.updatedBy?.toString(),
      deletedBy: listing.deletedBy?.toString(),
      deletedAt: listing.deletedAt,
      keywords: listing.keywords,
      republishCount: listing.republishCount,
      lastRepublishedAt: listing.lastRepublishedAt,
      republishHistory: listing.republishHistory,
      essentialData: listing.essentialData,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      deleted_at: listing.deleted_at,
      category: listing.category ? {
        id: listing.category.id,
        name: listing.category.name,
        slug: listing.category.slug
      } : null
    }));
  }
}

export default new UserProfileService();