import { Op } from 'sequelize';
import sequelize from '#config/database.js';

class SearchHelper {
  /**
   * Generate keywords string from listing data
   * @param {Object} listingData - Basic listing data
   * @param {Object} categorySpecificData - Car/Property specific data
   * @returns {string} Keywords string
   */
  static generateKeywords(listingData, categorySpecificData = null) {
    const keywords = [];

    // Basic listing keywords
    if (listingData.title) {
      keywords.push(listingData.title.toLowerCase());
    }

    // Location keywords
    if (listingData.locality) keywords.push(listingData.locality.toLowerCase());
    if (listingData.cityName) keywords.push(listingData.cityName.toLowerCase());
    if (listingData.stateName) keywords.push(listingData.stateName.toLowerCase());
    if (listingData.pincode) keywords.push(listingData.pincode);

    // Price range keywords
    if (listingData.price) {
      const price = parseFloat(listingData.price);
      if (price < 100000) keywords.push('under-1-lakh');
      else if (price < 500000) keywords.push('under-5-lakh');
      else if (price < 1000000) keywords.push('under-10-lakh');
      else if (price < 2000000) keywords.push('under-20-lakh');
      else keywords.push('above-20-lakh');
    }

    // Seller type keywords
    if (listingData.postedByType) {
      keywords.push(listingData.postedByType.toLowerCase());
    }

    // Category-specific keywords
    if (categorySpecificData) {
      // Car-specific keywords
      if (categorySpecificData.brand) keywords.push(categorySpecificData.brand.toLowerCase());
      if (categorySpecificData.model) keywords.push(categorySpecificData.model.toLowerCase());
      if (categorySpecificData.variant) keywords.push(categorySpecificData.variant.toLowerCase());
      if (categorySpecificData.fuelType) keywords.push(categorySpecificData.fuelType.toLowerCase());
      if (categorySpecificData.transmission) keywords.push(categorySpecificData.transmission.toLowerCase());
      if (categorySpecificData.year) keywords.push(categorySpecificData.year.toString());
      if (categorySpecificData.color) keywords.push(categorySpecificData.color.toLowerCase());
      if (categorySpecificData.bodyType) keywords.push(categorySpecificData.bodyType.toLowerCase());

      // Property-specific keywords
      if (categorySpecificData.propertyType) keywords.push(categorySpecificData.propertyType.toLowerCase());
      if (categorySpecificData.bedrooms) keywords.push(`${categorySpecificData.bedrooms}bhk`);
      if (categorySpecificData.bathrooms) keywords.push(`${categorySpecificData.bathrooms}bathroom`);
      if (categorySpecificData.furnishingStatus) keywords.push(categorySpecificData.furnishingStatus.toLowerCase());
      if (categorySpecificData.facing) keywords.push(`${categorySpecificData.facing}-facing`);
      if (categorySpecificData.floorNumber) keywords.push(`floor-${categorySpecificData.floorNumber}`);
    }

    // Remove duplicates, filter empty values, and join
    return [...new Set(keywords.filter(Boolean))].join(' ');
  }

  /**
   * Calculate location-based score with fallback handling
   * @param {Object} userLocation - User's location {stateId, cityId, source, priority}
   * @param {Object} listingLocation - Listing's location {stateId, cityId}
   * @returns {number} Location score (0-50)
   */
  static calculateLocationScore(userLocation, listingLocation) {
    // If no user location available, no location bonus (generalized listings)
    if (!userLocation || !listingLocation) return 0;

    // Base score calculation
    let baseScore = 0;

    // Same city gets highest score
    if (userLocation.cityId === listingLocation.cityId) {
      baseScore = 50;
    }
    // Same state gets medium score
    else if (userLocation.stateId === listingLocation.stateId) {
      baseScore = 25;
    }
    // Different state gets no bonus
    else {
      baseScore = 0;
    }

    // Apply multiplier based on location source priority
    let multiplier = 1.0;
    
    if (userLocation.source) {
      switch (userLocation.source) {
        case 'user_preferred':
          multiplier = 1.0; // Full score for user preferred location
          break;
        case 'browser_geolocation':
          multiplier = 0.9; // 90% score for GPS location
          break;
        case 'user_profile':
          multiplier = 0.8; // 80% score for profile location
          break;
        case 'ip_geolocation':
          multiplier = 0.6; // 60% score for IP-based location
          break;
        case 'query_params':
          multiplier = 0.5; // 50% score for query params
          break;
        default:
          multiplier = 0.3; // 30% score for unknown source
      }
    }

    return Math.round(baseScore * multiplier);
  }

  /**
   * Calculate paid listing bonus
   * @param {boolean} isPaidListing - Whether listing is paid
   * @returns {number} Paid listing score (0-30)
   */
  static calculatePaidListingScore(isPaidListing) {
    return isPaidListing ? 30 : 0;
  }

  /**
   * Calculate featured listing bonus
   * @param {boolean} isFeatured - Whether listing is featured
   * @param {Date} featuredUntil - Featured until date
   * @returns {number} Featured score (0-20)
   */
  static calculateFeaturedScore(isFeatured, featuredUntil) {
    if (!isFeatured) return 0;
    
    // Check if still featured
    if (featuredUntil && new Date() > new Date(featuredUntil)) {
      return 0;
    }

    return 20;
  }

  /**
   * Calculate freshness bonus
   * @param {Date} createdAt - Listing creation date
   * @returns {number} Freshness score (0-10)
   */
  static calculateFreshnessScore(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) return 10;      // Last 24 hours
    if (daysDiff <= 7) return 7;       // Last week
    if (daysDiff <= 30) return 5;      // Last month
    return 0;                          // Older than month
  }

  /**
   * Build search WHERE clause for PostgreSQL full-text search
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Object} Sequelize where clause
   */
  static buildSearchWhere(query, filters = {}) {
    const whereClause = {
      status: 'active' // Only show active listings
    };

    // Text search using PostgreSQL full-text search
    if (query && query.trim()) {
      const searchQuery = query.trim().replace(/[^\w\s]/g, ''); // Sanitize query
      
      whereClause[Op.and] = [
        sequelize.literal(`
          to_tsvector('english', 
            coalesce(title, '') || ' ' || 
            coalesce(description, '') || ' ' || 
            coalesce(keywords, '')
          ) @@ plainto_tsquery('english', '${searchQuery}')
        `)
      ];
    }

    // Category filter
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    // Price range filter
    if (filters.priceMin || filters.priceMax) {
      whereClause.price = {};
      if (filters.priceMin) whereClause.price[Op.gte] = filters.priceMin;
      if (filters.priceMax) whereClause.price[Op.lte] = filters.priceMax;
    }

    // Location filters
    if (filters.stateId) {
      whereClause.stateId = filters.stateId;
    }
    if (filters.cityId) {
      whereClause.cityId = filters.cityId;
    }

    // Seller type filter
    if (filters.postedByType) {
      whereClause.postedByType = filters.postedByType;
    }

    // Featured listings filter
    if (filters.featuredOnly) {
      whereClause.isFeatured = true;
      whereClause.featuredUntil = {
        [Op.or]: [
          { [Op.is]: null },
          { [Op.gt]: new Date() }
        ]
      };
    }

    return whereClause;
  }

  /**
   * Build ORDER BY clause with search ranking and location priority
   * @param {string} query - Search query
   * @param {string} sortBy - Sort field
   * @param {Object} userLocation - User location for scoring
   * @returns {Array} Sequelize order array
   */
  static buildSearchOrder(query, sortBy = 'relevance', userLocation = null) {
    switch (sortBy) {
      case 'price_low':
        return [['price', 'ASC']];
      
      case 'price_high':
        return [['price', 'DESC']];
      
      case 'date_new':
        return [['created_at', 'DESC']];
      
      case 'date_old':
        return [['created_at', 'ASC']];
      
      case 'relevance':
      default:
        const orderClauses = [];

        // Text search ranking (if query provided)
        if (query && query.trim()) {
          const searchQuery = query.trim().replace(/[^\w\s]/g, '');
          orderClauses.push(
            sequelize.literal(`
              ts_rank(
                to_tsvector('english', 
                  coalesce(title, '') || ' ' || 
                  coalesce(description, '') || ' ' || 
                  coalesce(keywords, '')
                ), 
                plainto_tsquery('english', '${searchQuery}')
              ) DESC
            `)
          );
        }

        // Location-based ordering (if user location available)
        if (userLocation && userLocation.stateId && userLocation.cityId) {
          // Prioritize same city, then same state
          orderClauses.push(
            sequelize.literal(`
              CASE 
                WHEN city_id = ${userLocation.cityId} THEN 3
                WHEN state_id = ${userLocation.stateId} THEN 2
                ELSE 1
              END DESC
            `)
          );
        }

        // Standard priority ordering
        orderClauses.push(['is_featured', 'DESC']);
        orderClauses.push(['is_paid_listing', 'DESC']);
        orderClauses.push(['created_at', 'DESC']);

        return orderClauses;
    }
  }

  /**
   * Get search suggestions based on query
   * @param {string} query - Partial search query
   * @param {number} limit - Number of suggestions
   * @returns {Array} Search suggestions
   */
  static getSearchSuggestions(query, limit = 5) {
    // This would typically query a suggestions table or use elasticsearch
    // For now, return common search terms
    const commonSearches = [
      'honda city', 'maruti swift', 'hyundai i20', 'toyota innova',
      'mahindra xuv500', 'tata nexon', 'ford ecosport', 'renault duster',
      '2bhk apartment', '3bhk house', 'office space', 'commercial property'
    ];

    if (!query) return commonSearches.slice(0, limit);

    return commonSearches
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }
}

export default SearchHelper;