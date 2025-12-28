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
      attributes: ['id', 'shareCode']
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
        attributes: ['id', 'fullName', 'email', 'mobile'],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: State, as: 'state', attributes: ['id', 'name', 'slug'] },
      { model: City, as: 'city', attributes: ['id', 'name', 'slug'] },
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

    // Add favorite count if listing exists
    if (listing && options.includeAll) {
      const favoriteCount = await UserFavorite.count({
        where: { listingId: id }
      });
      
      // Add favoriteCount as a virtual field
      listing.dataValues.favoriteCount = favoriteCount;

      // Add isFavorited field for the current user
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
        attributes: ['id', 'fullName', 'email', 'mobile'],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profilePhoto', 'profilePhotoStorageType', 'profilePhotoMimeType']
          }
        ]
      },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: State, as: 'state', attributes: ['id', 'name', 'slug'] },
      { model: City, as: 'city', attributes: ['id', 'name', 'slug'] },
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

    // Add favorite count if listing exists
    if (listing && options.includeAll) {
      const favoriteCount = await UserFavorite.count({
        where: { listingId: listing.id }
      });
      
      // Add favoriteCount as a virtual field
      listing.dataValues.favoriteCount = favoriteCount;

      // Add isFavorited field for the current user
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
   * Get all listings with filters and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @param {number|null} userId - User ID to check favorites for
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}, pagination = {}, userId = null) {
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

    // Include associations
    const include = [
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'fullName', 'mobile']
      },
      { 
        model: Category, 
        as: 'category', 
        attributes: ['id', 'name', 'slug'],
        where: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
        required: categoryJoinRequired
      },
      { model: State, as: 'state', attributes: ['id', 'name', 'slug'] },
      { model: City, as: 'city', attributes: ['id', 'name', 'slug'] },
      { 
        model: ListingMedia, 
        as: 'media', 
        where: { isPrimary: true },
        required: false,
        attributes: ['id', 'mediaUrl', 'thumbnailUrl', 'mediaType', 'storageType', 'mimeType', 'thumbnailMimeType']
      }
    ];

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

    // Order
    const order = [];
    if (filters.isFeatured) {
      order.push(['is_featured', 'DESC']);
    }
    if (filters.sortBy === 'price_asc') {
      order.push(['price', 'ASC']);
    } else if (filters.sortBy === 'price_desc') {
      order.push(['price', 'DESC']);
    } else if (filters.sortBy === 'date_asc') {
      order.push(['created_at', 'ASC']);
    } else if (filters.sortBy === 'views') {
      order.push(['view_count', 'DESC']);
    } else {
      order.push(['created_at', 'DESC']);
    }

    const { count, rows } = await Listing.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });

    // Add favorite counts to each listing
    const listingsWithFavorites = await Promise.all(
      rows.map(async (listing) => {
        const favoriteCount = await UserFavorite.count({
          where: { listingId: listing.id }
        });
        
        // Add favoriteCount as a virtual field
        listing.dataValues.favoriteCount = favoriteCount;
        return listing;
      })
    );

    // Add isFavorited field for the current user
    const listingsWithFavoritedStatus = await this.addIsFavoritedField(listingsWithFavorites, userId);

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

    // Build includes for associations
    const include = [
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'fullName', 'mobile']
      },
      { 
        model: Category, 
        as: 'category', 
        attributes: ['id', 'name', 'slug']
      },
      { 
        model: State, 
        as: 'state', 
        attributes: ['id', 'name', 'slug']
      },
      { 
        model: City, 
        as: 'city', 
        attributes: ['id', 'name', 'slug']
      },
      { 
        model: ListingMedia, 
        as: 'media', 
        where: { isPrimary: true },
        required: false,
        attributes: ['id', 'mediaUrl', 'thumbnailUrl', 'mediaType', 'storageType', 'mimeType', 'thumbnailMimeType']
      }
    ];

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

    // Calculate search scores and location matches for each result, and add favorite counts
    const enrichedResults = await Promise.all(
      rows.map(async (listing) => {
        const listingData = listing.toJSON();
        
        // Get favorite count
        const favoriteCount = await UserFavorite.count({
          where: { listingId: listing.id }
        });
        
        // Calculate location match
        const locationMatch = LocationHelper.getLocationMatch(
          userLocation,
          { stateId: listing.stateId, cityId: listing.cityId }
        );

        const scoreResult = ScoringHelper.calculateTotalScore(listing, {
          userLocation
        });

        // Check if user has favorited this listing
        let isFavorited = false;
        if (userId) {
          const userFavorite = await UserFavorite.findOne({
            where: { userId, listingId: listing.id }
          });
          isFavorited = !!userFavorite;
        }

        return {
          ...listingData,
          favoriteCount,
          isFavorited,
          totalScore: scoreResult.totalScore,
          locationMatch: locationMatch.type,
          scoreBreakdown: scoreResult.breakdown
        };
      })
    );

    const sortedResults = sortBy === 'relevance' 
      ? ScoringHelper.sortListings(enrichedResults)
      : enrichedResults;

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
      featuredLimit = 10
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
          attributes: ['id', 'name', 'slug'],
          where: { isActive: true }
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: City,
          as: 'city',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ListingMedia,
          as: 'media',
          attributes: ['id', 'mediaUrl', 'thumbnailUrl', 'mediaType', 'storageType', 'mimeType', 'thumbnailMimeType', 'isPrimary'],
          where: { isPrimary: true },
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(featuredLimit)
    });

    result.featured = featuredListings;

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
            },
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name', 'slug']
            },
            {
              model: City,
              as: 'city',
              attributes: ['id', 'name', 'slug']
            },
            {
              model: ListingMedia,
              as: 'media',
              attributes: ['id', 'mediaUrl', 'thumbnailUrl', 'mediaType', 'storageType', 'mimeType', 'thumbnailMimeType', 'isPrimary'],
              where: { isPrimary: true },
              required: false
            }
          ],
          order: [['created_at', 'DESC']],
          limit: parseInt(limit)
        });

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

        if (categoryListings.length > 0) {
          const category = categoryListings[0].category;
          result.byCategory[categoryId] = {
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug,
            listings: categoryListings,
            totalCount
          };
        }
      }
    }

    return result;
  }

  async findRelatedListings(listingId, limit = 6) {
    const currentListing = await Listing.findByPk(listingId, {
      attributes: ['id', 'categoryId', 'price', 'stateId', 'cityId']
    });

    if (!currentListing) {
      return [];
    }

    const where = {
      id: { [Op.ne]: listingId },
      status: 'active',
      expiresAt: { [Op.gt]: new Date() }
    };

    const listings = await Listing.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: City,
          as: 'city',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ListingMedia,
          as: 'media',
          attributes: ['id', 'mediaUrl', 'thumbnailUrl', 'mediaType', 'storageType', 'mimeType', 'thumbnailMimeType'],
          where: { isPrimary: true },
          required: false
        }
      ],
      limit: limit * 3,
      order: [['created_at', 'DESC']]
    });

    const scoredListings = listings.map(listing => {
      const similarityScore = ScoringHelper.calculateSimilarityScore(
        listing,
        currentListing
      );

      return {
        ...listing.toJSON(),
        similarityScore
      };
    });

    scoredListings.sort((a, b) => {
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return scoredListings.slice(0, limit);
  }
}

export default new ListingRepository();
