/**
 * Listing Repository
 * Handles database operations for listings
 */

import models from '#models/index.js';
import { Op } from 'sequelize';
import sequelize from '#config/database.js';
import SearchHelper from '#utils/searchHelper.js';
import LocationHelper from '#utils/locationHelper.js';
import ScoringHelper from '#utils/scoringHelper.js';

const { Listing, CarListing, PropertyListing, ListingMedia, Category, State, City, User, UserProfile, UserFavorite } = models;

class ListingRepository {
  /**
   * Add isFavorited field to listings for a specific user
   * @param {Array} listings - Array of listing objects
   * @param {number|null} userId - User ID to check favorites for
   * @returns {Promise<Array>} Listings with isFavorited field
   */
  async addIsFavoritedField(listings, userId = null) {
    if (!userId || !listings || listings.length === 0) {
      // If no user or no listings, set isFavorited to false for all
      return listings.map(listing => {
        listing.dataValues.isFavorited = false;
        return listing;
      });
    }

    // Get all listing IDs
    const listingIds = listings.map(listing => listing.id);

    // Get user's favorites for these listings
    const userFavorites = await UserFavorite.findAll({
      where: {
        userId,
        listingId: { [Op.in]: listingIds }
      },
      attributes: ['listingId']
    });

    // Create a Set for faster lookup
    const favoritedListingIds = new Set(userFavorites.map(fav => fav.listingId));

    // Add isFavorited field to each listing
    return listings.map(listing => {
      listing.dataValues.isFavorited = favoritedListingIds.has(listing.id);
      return listing;
    });
  }

  /**
   * Create new listing
   * @param {Object} listingData - Listing data
   * @returns {Promise<Object>}
   */
  async create(listingData) {
    return await Listing.create(listingData);
  }

  async findByShareCode(shareCode) {
    return await Listing.findOne({
      where: { shareCode },
      attributes: ['id', 'shareCode', 'status']
    });
  }

  async updateShareCode(listingId, shareCode) {
    return await Listing.update(
      { shareCode },
      { where: { id: listingId } }
    );
  }

  async getById(id, options = {}, userId = null) {
    const { CarBrand, CarModel, CarVariant } = models;
    
    const include = options.includeAll ? [
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'fullName', 'email', 'mobile', 'isVerified', ['created_at', 'createdAt']],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      },
      { 
        model: CarListing, 
        as: 'carListing',
        include: [
          { model: CarBrand, as: 'brand', attributes: ['id', 'name', 'slug'] },
          { model: CarModel, as: 'model', attributes: ['id', 'name', 'slug'] },
          { model: CarVariant, as: 'variant', attributes: ['id', 'variantName', 'slug'], required: false }
        ]
      },
      { model: PropertyListing, as: 'propertyListing' },
      { model: ListingMedia, as: 'media', order: [['displayOrder', 'ASC']] }
    ] : [];

    const listing = await Listing.findByPk(id, {
      include,
      paranoid: options.includeDeleted ? false : true
    });

    // Add isFavorited field for the current user
    if (listing && options.includeAll) {
      if (userId) {
        const userFavorite = await UserFavorite.findOne({
          where: { userId, listingId: id }
        });
        listing.dataValues.isFavorited = !!userFavorite;
      } else {
        listing.dataValues.isFavorited = false;
      }
    }

    return listing;
  }

  /**
   * Get listing by slug
   * @param {string} slug - Listing slug
   * @param {Object} options - Query options
   * @param {number|null} userId - User ID to check favorites for
   * @returns {Promise<Object|null>}
   */
  async getBySlug(slug, options = {}, userId = null) {
    const { CarBrand, CarModel, CarVariant } = models;
    
    const include = options.includeAll ? [
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'fullName', 'email', 'mobile', 'isVerified', ['created_at', 'createdAt']],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      },
      { 
        model: CarListing, 
        as: 'carListing',
        include: [
          { model: CarBrand, as: 'brand', attributes: ['id', 'name', 'slug'] },
          { model: CarModel, as: 'model', attributes: ['id', 'name', 'slug'] },
          { model: CarVariant, as: 'variant', attributes: ['id', 'variantName', 'slug'], required: false }
        ]
      },
      { model: PropertyListing, as: 'propertyListing' },
      { model: ListingMedia, as: 'media', order: [['displayOrder', 'ASC']] }
    ] : [];

    const listing = await Listing.findOne({
      where: { slug },
      include
    });

    // Add isFavorited field for the current user
    if (listing && options.includeAll) {
      if (userId) {
        const userFavorite = await UserFavorite.findOne({
          where: { userId, listingId: listing.id }
        });
        listing.dataValues.isFavorited = !!userFavorite;
      } else {
        listing.dataValues.isFavorited = false;
      }
    }

    return listing;
  }

  /**
   * Get all listings for admin panel with user details
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getAllForAdmin(filters = {}, pagination = {}) {
    const where = {};
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Filter by user
    if (filters.userId) {
      where.userId = filters.userId;
    }

    // Filter by category ID
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filter by status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filter by location
    if (filters.stateId) {
      where.stateId = filters.stateId;
    }
    if (filters.cityId) {
      where.cityId = filters.cityId;
    }

    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price[Op.gte] = filters.minPrice;
      if (filters.maxPrice) where.price[Op.lte] = filters.maxPrice;
    }

    // Filter by featured
    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
      if (filters.isFeatured) {
        where.featuredUntil = { [Op.gt]: new Date() };
      }
    }

    // Search by title and description
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    // Include user details for admin panel
    const include = [
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'fullName', 'email', 'mobile', 'isVerified', ['created_at', 'createdAt']],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ];

    // Order by creation date (newest first)
    const order = [['created_at', 'DESC']];

    const { count, rows } = await Listing.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });

    return {
      listings: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get all listings with filters and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @param {number|null} userId - User ID to check favorites for
   * @param {Object} userLocation - User location for scoring
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}, pagination = {}, userId = null, userLocation = null) {
    const where = {};
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Filter by user
    if (filters.userId) {
      where.userId = filters.userId;
    }

    // Filter by category ID
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filter by category slug (need to join with Category table)
    let categoryJoinRequired = false;
    if (filters.categorySlug) {
      categoryJoinRequired = true;
    }

    // Filter by status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filter by location
    if (filters.stateId) {
      where.stateId = filters.stateId;
    }
    if (filters.cityId) {
      where.cityId = filters.cityId;
    }

    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price[Op.gte] = filters.minPrice;
      if (filters.maxPrice) where.price[Op.lte] = filters.maxPrice;
    }

    // Filter by featured
    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
      if (filters.isFeatured) {
        where.featuredUntil = { [Op.gt]: new Date() };
      }
    }

    // Search by title and description
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    // Include associations - minimal for list view
    const include = [];
    
    // Only add category join if filtering by slug (need to validate slug exists)
    if (categoryJoinRequired) {
      include.push({
        model: Category,
        as: 'category',
        attributes: ['id'],
        where: { slug: filters.categorySlug },
        required: true
      });
    }

    // Car-specific filters
    const carWhere = {};
    if (filters.brandId) carWhere.brandId = filters.brandId;
    if (filters.modelId) carWhere.modelId = filters.modelId;
    if (filters.variantId) carWhere.variantId = filters.variantId;
    if (filters.minYear) carWhere.year = { [Op.gte]: filters.minYear };
    if (filters.maxYear) {
      carWhere.year = carWhere.year || {};
      carWhere.year[Op.lte] = filters.maxYear;
    }
    if (filters.condition) carWhere.condition = filters.condition;
    if (filters.fuelType) carWhere.fuelType = filters.fuelType;
    if (filters.transmission) carWhere.transmission = filters.transmission;
    if (filters.bodyType) carWhere.bodyType = filters.bodyType;
    if (filters.minMileage) carWhere.mileageKm = { [Op.gte]: filters.minMileage };
    if (filters.maxMileage) {
      carWhere.mileageKm = carWhere.mileageKm || {};
      carWhere.mileageKm[Op.lte] = filters.maxMileage;
    }
    if (filters.ownersCount) carWhere.ownersCount = filters.ownersCount;

    // Add CarListing include if car filters are present
    if (Object.keys(carWhere).length > 0) {
      const { CarBrand, CarModel, CarVariant } = models;
      include.push({
        model: CarListing,
        as: 'carListing',
        where: carWhere,
        required: true,
        include: [
          { model: CarBrand, as: 'brand', attributes: ['id', 'name', 'slug'] },
          { model: CarModel, as: 'model', attributes: ['id', 'name', 'slug'] },
          { model: CarVariant, as: 'variant', attributes: ['id', 'variantName', 'slug'], required: false }
        ]
      });
    }

    // Property-specific filters
    const propertyWhere = {};
    if (filters.propertyType) {
      if (Array.isArray(filters.propertyType)) {
        propertyWhere.propertyType = { [Op.in]: filters.propertyType };
      } else {
        propertyWhere.propertyType = filters.propertyType;
      }
    }
    if (filters.listingType) propertyWhere.listingType = filters.listingType;
    if (filters.bedrooms) propertyWhere.bedrooms = filters.bedrooms;
    if (filters.bathrooms) propertyWhere.bathrooms = filters.bathrooms;
    if (filters.minArea) propertyWhere.areaSqft = { [Op.gte]: filters.minArea };
    if (filters.maxArea) {
      propertyWhere.areaSqft = propertyWhere.areaSqft || {};
      propertyWhere.areaSqft[Op.lte] = filters.maxArea;
    }
    if (filters.furnished) propertyWhere.furnished = filters.furnished;
    if (filters.facing) propertyWhere.facing = filters.facing;
    if (filters.parkingSpaces !== undefined) propertyWhere.parkingSpaces = { [Op.gte]: filters.parkingSpaces };

    // Add PropertyListing include if property filters are present
    if (Object.keys(propertyWhere).length > 0) {
      include.push({
        model: PropertyListing,
        as: 'propertyListing',
        where: propertyWhere,
        required: true
      });
    }

    // Order - Always fetch enough records for scoring and pagination
    const useScoring = true;
    
    const order = [];
    if (!useScoring) {
      if (filters.isFeatured) {
        order.push(['is_featured', 'DESC']);
      }
      if (filters.sortBy === 'price_asc' || filters.sortBy === 'price_low') {
        order.push(['price', 'ASC']);
      } else if (filters.sortBy === 'price_desc' || filters.sortBy === 'price_high') {
        order.push(['price', 'DESC']);
      } else if (filters.sortBy === 'date_asc' || filters.sortBy === 'date_old') {
        order.push(['created_at', 'ASC']);
      } else if (filters.sortBy === 'date_desc' || filters.sortBy === 'date_new') {
        order.push(['created_at', 'DESC']);
      } else if (filters.sortBy === 'views') {
        order.push(['view_count', 'DESC']);
      } else {
        order.push(['created_at', 'DESC']);
      }
    }

    const { count, rows } = await Listing.findAndCountAll({
      where,
      include,
      order: useScoring ? [['created_at', 'DESC']] : order,
      limit: useScoring ? undefined : limit,
      offset: useScoring ? undefined : offset,
      distinct: true
    });

    let listingsWithFavoritedStatus = await this.addIsFavoritedField(rows, userId);

    if (useScoring) {
      const scoredListings = listingsWithFavoritedStatus.map(listing => {
        const listingData = listing.toJSON();
        const scoreResult = ScoringHelper.calculateTotalScore(listingData, { userLocation });
        
        return {
          ...listing.dataValues,
          totalScore: scoreResult.totalScore,
          scoreBreakdown: scoreResult.breakdown
        };
      });

      const sortBy = filters.sortBy || 'relevance';
      const sortedListings = sortBy === 'relevance'
        ? ScoringHelper.sortListings(scoredListings)
        : ScoringHelper.sortListingsWithPrimary(scoredListings, sortBy);
      
      const paginatedListings = sortedListings.slice(offset, offset + limit);
      
      listingsWithFavoritedStatus = paginatedListings.map(listingData => {
        const listing = Listing.build(listingData, { isNewRecord: false, raw: true });
        listing.dataValues = listingData;
        return listing;
      });
    }

    return {
      listings: listingsWithFavoritedStatus,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update listing
   * @param {number} id - Listing ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Additional options (userId for audit)
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData, options = {}) {
    const listing = await Listing.findByPk(id);
    if (!listing) return null;

    await listing.update(updateData, options);
    return listing;
  }

  /**
   * Update listing status
   * @param {number} id - Listing ID
   * @param {string} status - New status
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>}
   */
  async updateStatus(id, status, options = {}) {
    return await this.update(id, { status }, options);
  }

  /**
   * Approve listing
   * @param {number} id - Listing ID
   * @param {number} approvedBy - User ID who approved
   * @returns {Promise<Object|null>}
   */
  async approve(id, approvedBy) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return await this.update(id, {
      status: 'active',
      approvedAt: now,
      approvedBy,
      publishedAt: now,
      expiresAt,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null
    });
  }

  /**
   * Reject listing
   * @param {number} id - Listing ID
   * @param {number} rejectedBy - User ID who rejected
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object|null>}
   */
  async reject(id, rejectedBy, reason) {
    return await this.update(id, {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy,
      rejectionReason: reason,
      approvedAt: null,
      approvedBy: null
    });
  }

  /**
   * Update featured status
   * @param {number} id - Listing ID
   * @param {boolean} isFeatured - Featured status
   * @param {Date} featuredUntil - Featured until date
   * @returns {Promise<Object|null>}
   */
  async updateFeaturedStatus(id, isFeatured, featuredUntil = null) {
    return await this.update(id, { isFeatured, featuredUntil });
  }

  /**
   * Increment view count
   * @param {number} id - Listing ID
   * @returns {Promise<boolean>}
   */
  async incrementViewCount(id) {
    const listing = await Listing.findByPk(id);
    if (!listing) return false;

    await listing.increment('viewCount');
    return true;
  }

  /**
   * Increment contact count
   * @param {number} id - Listing ID
   * @returns {Promise<boolean>}
   */
  async incrementContactCount(id) {
    const listing = await Listing.findByPk(id);
    if (!listing) return false;

    await listing.increment('contactCount');
    return true;
  }

  /**
   * Soft delete listing
   * @param {number} id - Listing ID
   * @param {number} deletedBy - User ID who deleted
   * @returns {Promise<boolean>}
   */
  async delete(id, deletedBy) {
    const listing = await Listing.findByPk(id);
    if (!listing) return false;

    await listing.update({ deletedBy });
    await listing.destroy();
    return true;
  }

  /**
   * Check if slug exists
   * @param {string} slug - Listing slug
   * @param {number} excludeId - Exclude this ID from check
   * @returns {Promise<boolean>}
   */
  async slugExists(slug, excludeId = null) {
    const where = { slug };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const count = await Listing.count({ where });
    return count > 0;
  }

  /**
   * Search listings with advanced filtering and ranking
   * @param {Object} searchParams - Search parameters
   * @param {Object} userLocation - User location for proximity scoring
   * @param {Object} pagination - Pagination options
   * @param {number|null} userId - User ID to check favorites for
   * @returns {Promise<Object>}
   */
  async searchListings(searchParams, userLocation = null, pagination = {}, userId = null) {
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
      filters = {} // Category-specific filters
    } = searchParams;

    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Build WHERE clause using SearchHelper
    const where = SearchHelper.buildSearchWhere(query, {
      categoryId,
      priceMin,
      priceMax,
      stateId,
      cityId,
      postedByType,
      featuredOnly
    });

    // Add locality filter if provided
    if (locality) {
      where.locality = { [Op.iLike]: `%${locality}%` };
    }

    // Build includes for associations - minimal for search results
    const include = [];

    // Add category-specific includes and filters
    if (categoryId) {
      const { CarBrand, CarModel, CarVariant } = models;
      
      // Car category filters
      if (filters.brandId || filters.modelId || filters.variantId || filters.year || 
          filters.fuelType || filters.transmission || filters.condition) {
        
        const carWhere = {};
        if (filters.brandId) carWhere.brandId = filters.brandId;
        if (filters.modelId) carWhere.modelId = filters.modelId;
        if (filters.variantId) carWhere.variantId = filters.variantId;
        if (filters.year) carWhere.year = filters.year;
        if (filters.fuelType) carWhere.fuelType = filters.fuelType;
        if (filters.transmission) carWhere.transmission = filters.transmission;
        if (filters.condition) carWhere.condition = filters.condition;
        if (filters.minMileage) carWhere.mileageKm = { [Op.gte]: filters.minMileage };
        if (filters.maxMileage) {
          carWhere.mileageKm = carWhere.mileageKm || {};
          carWhere.mileageKm[Op.lte] = filters.maxMileage;
        }

        include.push({
          model: CarListing,
          as: 'carListing',
          where: carWhere,
          required: true,
          include: [
            { model: CarBrand, as: 'brand', attributes: ['id', 'name', 'slug'] },
            { model: CarModel, as: 'model', attributes: ['id', 'name', 'slug'] },
            { model: CarVariant, as: 'variant', attributes: ['id', 'variantName', 'slug'], required: false }
          ]
        });
      }

      // Property category filters
      if (filters.propertyType || filters.bedrooms || filters.bathrooms || filters.areaSqft) {
        const propertyWhere = {};
        if (filters.propertyType) {
          if (Array.isArray(filters.propertyType)) {
            propertyWhere.propertyType = { [Op.in]: filters.propertyType };
          } else {
            propertyWhere.propertyType = filters.propertyType;
          }
        }
        if (filters.bedrooms) propertyWhere.bedrooms = filters.bedrooms;
        if (filters.bathrooms) propertyWhere.bathrooms = filters.bathrooms;
        if (filters.minArea) propertyWhere.areaSqft = { [Op.gte]: filters.minArea };
        if (filters.maxArea) {
          propertyWhere.areaSqft = propertyWhere.areaSqft || {};
          propertyWhere.areaSqft[Op.lte] = filters.maxArea;
        }

        include.push({
          model: PropertyListing,
          as: 'propertyListing',
          where: propertyWhere,
          required: true
        });
      }
    }

    // Build ORDER BY clause using SearchHelper
    const order = SearchHelper.buildSearchOrder(query, sortBy, userLocation);

    // Execute search query
    const { count, rows } = await Listing.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });

    // Calculate search scores and location matches for each result
    const listingsWithFavorited = await this.addIsFavoritedField(rows, userId);
    
    const enrichedResults = listingsWithFavorited.map((listing) => {
      const listingData = listing.toJSON ? listing.toJSON() : listing;
      
      const locationMatch = LocationHelper.getLocationMatch(
        userLocation,
        { stateId: listingData.stateId, cityId: listingData.cityId }
      );

      const scoreResult = ScoringHelper.calculateTotalScore(listingData, {
        userLocation
      });

      return {
        ...listingData,
        totalScore: scoreResult.totalScore,
        locationMatch: locationMatch.type,
        scoreBreakdown: scoreResult.breakdown
      };
    });

    const sortedResults = sortBy === 'relevance' 
      ? ScoringHelper.sortListings(enrichedResults)
      : ScoringHelper.sortListingsWithPrimary(enrichedResults, sortBy);

    return {
      listings: sortedResults,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      searchMeta: {
        query: query || '',
        totalResults: count,
        hasLocationFilter: !!(stateId || cityId),
        userLocation: userLocation || null
      }
    };
  }

  /**
   * Get search suggestions based on query
   * @param {string} query - Search query
   * @param {Object} userLocation - User location
   * @param {number} limit - Number of suggestions
   * @returns {Promise<Array>}
   */
  async getSearchSuggestions(query, userLocation = null, limit = 5) {
    if (!query || query.length < 2) {
      return SearchHelper.getSearchSuggestions('', limit);
    }

    // Get suggestions from existing listing titles and keywords
    const suggestions = await Listing.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { keywords: { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: ['title', 'keywords'],
      limit: limit * 2, // Get more to filter and deduplicate
      order: [['view_count', 'DESC']]
    });

    // Extract unique suggestions
    const suggestionSet = new Set();
    
    suggestions.forEach(listing => {
      // Add title words that match
      const titleWords = listing.title.toLowerCase().split(' ');
      titleWords.forEach(word => {
        if (word.includes(query.toLowerCase()) && word.length > 2) {
          suggestionSet.add(word);
        }
      });

      // Add keyword matches
      if (listing.keywords) {
        const keywords = listing.keywords.toLowerCase().split(' ');
        keywords.forEach(keyword => {
          if (keyword.includes(query.toLowerCase()) && keyword.length > 2) {
            suggestionSet.add(keyword);
          }
        });
      }
    });

    return Array.from(suggestionSet).slice(0, limit);
  }

  /**
   * Get available search filters for a category
   * @param {number} categoryId - Category ID
   * @param {Object} userLocation - User location
   * @returns {Promise<Object>}
   */
  async getSearchFilters(categoryId, userLocation = null) {
    const filters = {
      priceRanges: [
        { label: 'Under ₹1 Lakh', min: 0, max: 100000 },
        { label: '₹1-5 Lakh', min: 100000, max: 500000 },
        { label: '₹5-10 Lakh', min: 500000, max: 1000000 },
        { label: '₹10-20 Lakh', min: 1000000, max: 2000000 },
        { label: 'Above ₹20 Lakh', min: 2000000, max: null }
      ],
      postedByTypes: [
        { value: 'owner', label: 'Owner' },
        { value: 'agent', label: 'Agent' },
        { value: 'dealer', label: 'Dealer' }
      ]
    };

    // Add category-specific filters
    if (categoryId) {
      const { CarBrand, CarModel } = models;
      
      // Car category filters
      const carBrands = await CarBrand.findAll({
        attributes: ['id', 'name', 'slug'],
        order: [['name', 'ASC']]
      });

      if (carBrands.length > 0) {
        filters.carFilters = {
          brands: carBrands,
          fuelTypes: [
            { value: 'petrol', label: 'Petrol' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'cng', label: 'CNG' },
            { value: 'electric', label: 'Electric' },
            { value: 'hybrid', label: 'Hybrid' }
          ],
          transmissions: [
            { value: 'manual', label: 'Manual' },
            { value: 'automatic', label: 'Automatic' },
            { value: 'cvt', label: 'CVT' }
          ],
          conditions: [
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' }
          ]
        };
      }

      // Property category filters
      filters.propertyFilters = {
        propertyTypes: [
          { value: 'apartment', label: 'Apartment' },
          { value: 'house', label: 'House' },
          { value: 'villa', label: 'Villa' },
          { value: 'plot', label: 'Plot' }
        ],
        bedrooms: [
          { value: 1, label: '1 BHK' },
          { value: 2, label: '2 BHK' },
          { value: 3, label: '3 BHK' },
          { value: 4, label: '4+ BHK' }
        ]
      };
    }

    return filters;
  }

  /**
   * Update listing keywords
   * @param {number} id - Listing ID
   * @param {string} keywords - Keywords string
   * @returns {Promise<boolean>}
   */
  async updateKeywords(id, keywords) {
    const listing = await Listing.findByPk(id);
    if (!listing) return false;

    await listing.update({ keywords });
    return true;
  }

  /**
   * Get statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getStats(filters = {}) {
    const where = {};
    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [total, draft, pending, active, expired, sold, rejected] = await Promise.all([
      Listing.count({ where }),
      Listing.count({ where: { ...where, status: 'draft' } }),
      Listing.count({ where: { ...where, status: 'pending' } }),
      Listing.count({ where: { ...where, status: 'active' } }),
      Listing.count({ where: { ...where, status: 'expired' } }),
      Listing.count({ where: { ...where, status: 'sold' } }),
      Listing.count({ where: { ...where, status: 'rejected' } })
    ]);

    return {
      total,
      draft,
      pending,
      active,
      expired,
      sold,
      rejected
    };
  }

  /**
   * Get homepage listings with category-wise filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getHomepageListings(filters = {}) {
    const {
      categories = [],
      limit = 10,
      featuredLimit = 10,
      userLocation = null
    } = filters;

    const baseWhere = {
      status: 'active',
      expiresAt: { [Op.gt]: new Date() }
    };

    const result = {
      featured: [],
      byCategory: {}
    };

    const featuredListings = await Listing.findAll({
      where: {
        ...baseWhere,
        isFeatured: true,
        featuredUntil: { [Op.gt]: new Date() }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id'],
          where: { isActive: true }
        }
      ]
    });

    const scoredFeaturedListings = featuredListings.map(listing => {
      const listingData = listing.toJSON();
      const scoreResult = ScoringHelper.calculateTotalScore(listingData, { userLocation });
      
      return {
        ...listingData,
        totalScore: scoreResult.totalScore,
        scoreBreakdown: scoreResult.breakdown
      };
    });

    const sortedFeaturedListings = ScoringHelper.sortListings(scoredFeaturedListings);
    result.featured = sortedFeaturedListings.slice(0, parseInt(featuredLimit));

    if (categories.length > 0) {
      for (const categoryId of categories) {
        const categoryListings = await Listing.findAll({
          where: {
            ...baseWhere,
            categoryId
          },
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'],
              where: { isActive: true }
            }
          ]
        });

        const scoredCategoryListings = categoryListings.map(listing => {
          const listingData = listing.toJSON();
          const scoreResult = ScoringHelper.calculateTotalScore(listingData, { userLocation });
          
          return {
            ...listingData,
            totalScore: scoreResult.totalScore,
            scoreBreakdown: scoreResult.breakdown
          };
        });

        const sortedCategoryListings = ScoringHelper.sortListings(scoredCategoryListings);

        const totalCount = await Listing.count({
          where: {
            ...baseWhere,
            categoryId
          },
          include: [
            {
              model: Category,
              as: 'category',
              where: { isActive: true }
            }
          ]
        });

        if (sortedCategoryListings.length > 0) {
          const category = categoryListings[0].category;
          result.byCategory[categoryId] = {
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug,
            listings: sortedCategoryListings.slice(0, parseInt(limit)),
            totalCount
          };
        }
      }
    }

    return result;
  }

  async findRelatedListings(listingId, limit = 6) {
    const currentListing = await Listing.findByPk(listingId, {
      attributes: ['id', 'categoryId', 'categorySlug', 'price', 'stateId', 'cityId'],
      include: [
        {
          model: CarListing,
          as: 'carListing',
          attributes: ['brandId', 'modelId', 'variantId'],
          required: false
        },
        {
          model: PropertyListing,
          as: 'propertyListing',
          attributes: ['propertyType'],
          required: false
        }
      ]
    });

    if (!currentListing) {
      return [];
    }

    const categorySlug = currentListing.categorySlug?.toLowerCase();
    const isCar = categorySlug === 'cars' || categorySlug === 'car';
    const isProperty = categorySlug === 'properties' || categorySlug === 'property';

    const where = {
      id: { [Op.ne]: listingId },
      categoryId: currentListing.categoryId,
      status: 'active',
      expiresAt: { [Op.gt]: new Date() }
    };

    let listings = [];

    if (isCar && currentListing.carListing) {
      const carWhere = {};
      if (currentListing.carListing.brandId) {
        carWhere.brandId = currentListing.carListing.brandId;
      }
      if (currentListing.carListing.modelId) {
        carWhere.modelId = currentListing.carListing.modelId;
      }
      if (currentListing.carListing.variantId) {
        carWhere.variantId = currentListing.carListing.variantId;
      }

      if (Object.keys(carWhere).length > 0) {
        listings = await Listing.findAll({
          where,
          include: [
            {
              model: CarListing,
              as: 'carListing',
              where: carWhere,
              required: true
            }
          ],
          limit: limit * 3,
          order: [['created_at', 'DESC']]
        });
      }

      if (listings.length < limit) {
        const additionalListings = await Listing.findAll({
          where: {
            ...where,
            id: { 
              [Op.notIn]: [listingId, ...listings.map(l => l.id)]
            }
          },
          limit: (limit * 3) - listings.length,
          order: [['created_at', 'DESC']]
        });
        listings = [...listings, ...additionalListings];
      }
    } else if (isProperty && currentListing.propertyListing) {
      const propertyType = currentListing.propertyListing.propertyType?.toLowerCase();
      
      const propertyGroups = {
        residential: ['house', 'apartment', 'villa'],
        commercial: ['office', 'shop'],
        accommodation: ['pg', 'hostel'],
        plot: ['plot'],
        warehouse: ['warehouse']
      };

      let allowedPropertyTypes = [propertyType];
      
      for (const [group, types] of Object.entries(propertyGroups)) {
        if (types.includes(propertyType)) {
          allowedPropertyTypes = types;
          break;
        }
      }

      listings = await Listing.findAll({
        where,
        include: [
          {
            model: PropertyListing,
            as: 'propertyListing',
            where: {
              propertyType: { [Op.in]: allowedPropertyTypes }
            },
            required: true
          }
        ],
        limit: limit * 3,
        order: [['created_at', 'DESC']]
      });
    } else {
      listings = await Listing.findAll({
        where,
        limit: limit * 3,
        order: [['created_at', 'DESC']]
      });
    }

    if (listings.length === 0) {
      return [];
    }

    const userLocation = {
      stateId: currentListing.stateId,
      cityId: currentListing.cityId
    };

    const scoredListings = listings.map(listing => {
      const listingData = listing.toJSON();
      
      const similarityScore = ScoringHelper.calculateSimilarityScore(
        listingData,
        currentListing
      );

      const scoreResult = ScoringHelper.calculateTotalScore(listingData, { userLocation });

      return {
        ...listingData,
        similarityScore,
        totalScore: scoreResult.totalScore,
        scoreBreakdown: scoreResult.breakdown
      };
    });

    scoredListings.sort((a, b) => {
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore;
      }
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return b.id - a.id;
    });

    return scoredListings.slice(0, limit);
  }

  async countFeaturedByUserAndCategory(userId, categoryId) {
    return await Listing.count({
      where: {
        userId,
        categoryId,
        isFeatured: true,
        status: 'active',
        featuredUntil: {
          [Op.gte]: new Date()
        }
      }
    });
  }
  /**
   * Get user's listing statistics by category using single query approach
   * @param {number} userId 
   * @param {number} categoryId 
   * @returns {Promise<Object>} Status counts
   */
  async getUserCategoryStats(userId, categoryId) {
    // Single query to get all listings with just status and expires_at
    const listings = await Listing.findAll({
      where: { userId, categoryId },
      attributes: ['status', 'expiresAt'],
      raw: true
    });

    // Process in JavaScript to calculate counts - much faster than 6 separate queries
    const stats = listings.reduce((acc, listing) => {
      const now = new Date();
      const expiresAt = new Date(listing.expiresAt);
      
      if (listing.status === 'active' && expiresAt > now) {
        acc.active++;
      } else if (listing.status === 'sold') {
        acc.sold++;
      } else if (listing.status === 'expired' || (listing.status === 'active' && expiresAt <= now)) {
        acc.expired++;
      } else if (listing.status === 'draft') {
        acc.draft++;
      } else if (listing.status === 'pending') {
        acc.pending++;
      } else if (listing.status === 'rejected') {
        acc.rejected++;
      }
      
      acc.total++;
      return acc;
    }, { active: 0, sold: 0, expired: 0, draft: 0, pending: 0, rejected: 0, total: 0 });

    return stats;
  }

  /**
   * Get user's recent listings for a category with complete data
   * @param {number} userId 
   * @param {number} categoryId 
   * @param {number} limit 
   * @returns {Promise<Array>} Recent listings
   */
  async getUserCategoryRecentListings(userId, categoryId, limit = 3) {
    return await Listing.findAll({
      where: { userId, categoryId },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      // Let Sequelize handle all fields and model getters automatically
      // This includes coverImage getter for URL transformation
      order: [['created_at', 'DESC']],
      limit
    });
  }

  /**
   * Get user's listings for a category with pagination and status filtering
   * @param {number} userId 
   * @param {number} categoryId 
   * @param {Object} options - { page, limit, status }
   * @returns {Promise<Object>} Paginated listings
   */
  async getUserCategoryListings(userId, categoryId, options = {}) {
    const { page = 1, limit = 20, status = 'all' } = options;
    const validLimit = Math.min(Math.max(1, parseInt(limit)), 50);
    const validPage = Math.max(1, parseInt(page));
    const offset = (validPage - 1) * validLimit;

    // Build where clause based on status filter
    let whereClause = { userId, categoryId };
    
    if (status === 'active') {
      whereClause.status = 'active';
      whereClause.expiresAt = { [Op.gt]: new Date() };
    } else if (status === 'sold') {
      whereClause.status = 'sold';
    } else if (status === 'expired') {
      whereClause[Op.or] = [
        { status: 'expired' },
        { 
          status: 'active',
          expiresAt: { [Op.lte]: new Date() }
        }
      ];
    } else if (status === 'draft') {
      whereClause.status = 'draft';
    } else if (status === 'pending') {
      whereClause.status = 'pending';
    } else if (status === 'rejected') {
      whereClause.status = 'rejected';
    }
    // 'all' status doesn't add any additional filters

    return await Listing.findAndCountAll({
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      // Let Sequelize handle all fields and model getters automatically
      order: [['created_at', 'DESC']],
      limit: validLimit,
      offset
    });
  }

  /**
   * Get total listings count for a user
   * @param {number} userId 
   * @returns {Promise<number>} Total count
   */
  async getUserTotalListingsCount(userId) {
    return await Listing.count({
      where: { userId }
    });
  }

  /**
   * Get subscription listing statistics using single query approach
   * @param {number} userId 
   * @param {number} subscriptionId 
   * @returns {Promise<Object>} Status counts
   */
  async getSubscriptionListingStats(userId, subscriptionId) {
    // Single query to get all listings with just status and expires_at
    const listings = await Listing.findAll({
      where: { userId, userSubscriptionId: subscriptionId },
      attributes: ['status', 'expiresAt'],
      raw: true
    });

    // Process in JavaScript to calculate counts - much faster than 7 separate queries
    const stats = listings.reduce((acc, listing) => {
      const now = new Date();
      const expiresAt = new Date(listing.expiresAt);
      
      if (listing.status === 'active' && expiresAt > now) {
        acc.active++;
      } else if (listing.status === 'sold') {
        acc.sold++;
      } else if (listing.status === 'expired' || (listing.status === 'active' && expiresAt <= now)) {
        acc.expired++;
      } else if (listing.status === 'draft') {
        acc.draft++;
      } else if (listing.status === 'pending') {
        acc.pending++;
      } else if (listing.status === 'rejected') {
        acc.rejected++;
      }
      
      acc.total++;
      return acc;
    }, { active: 0, sold: 0, expired: 0, draft: 0, pending: 0, rejected: 0, total: 0 });

    // Calculate used quota (only active, sold, and expired listings consume quota)
    stats.quotaConsuming = stats.active + stats.sold + stats.expired;

    return stats;
  }

  /**
   * Get subscription listings with pagination and status filtering
   * @param {number} userId 
   * @param {number} subscriptionId 
   * @param {Object} options - { page, limit, status }
   * @returns {Promise<Object>} Paginated listings
   */
  async getSubscriptionListings(userId, subscriptionId, options = {}) {
    const { page = 1, limit = 20, status = 'all' } = options;
    const validLimit = Math.min(Math.max(1, parseInt(limit)), 50);
    const validPage = Math.max(1, parseInt(page));
    const offset = (validPage - 1) * validLimit;

    // Build where clause based on status filter
    let whereClause = { 
      userId,
      userSubscriptionId: subscriptionId 
    };
    
    if (status === 'active') {
      whereClause.status = 'active';
      whereClause.expiresAt = { [Op.gt]: new Date() };
    } else if (status === 'sold') {
      whereClause.status = 'sold';
    } else if (status === 'expired') {
      whereClause[Op.or] = [
        { status: 'expired' },
        { 
          status: 'active',
          expiresAt: { [Op.lte]: new Date() }
        }
      ];
    } else if (status === 'rejected') {
      whereClause.status = 'rejected';
    } else if (status === 'pending') {
      whereClause.status = 'pending';
    } else if (status === 'draft') {
      whereClause.status = 'draft';
    }
    // 'all' status doesn't add additional filters

    return await Listing.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      // Let Sequelize handle all fields and model getters automatically
      // This includes coverImage getter, totalFavorites, and all other fields
      order: [['created_at', 'DESC']],
      limit: validLimit,
      offset
    });
  }

  /**
   * Get categories that have listings for a user
   * @param {number} userId 
   * @returns {Promise<Array>} Categories with listings
   */
  async getUserCategoriesWithListings(userId) {
    return await Category.findAll({
      include: [{
        model: Listing,
        as: 'listings',
        where: { userId },
        required: true,
        attributes: []
      }],
      attributes: ['id', 'name', 'slug'],
      group: ['Category.id', 'Category.name', 'Category.slug']
    });
  }
}

export default new ListingRepository();
