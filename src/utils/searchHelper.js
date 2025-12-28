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

    if (listingData.title) {
      keywords.push(listingData.title.toLowerCase());
    }

    if (listingData.locality) keywords.push(listingData.locality.toLowerCase());
    if (listingData.cityName) keywords.push(listingData.cityName.toLowerCase());
    if (listingData.stateName) keywords.push(listingData.stateName.toLowerCase());
    if (listingData.pincode) keywords.push(listingData.pincode);

    if (listingData.price) {
      const price = parseFloat(listingData.price);
      if (price < 100000) keywords.push('under-1-lakh');
      else if (price < 500000) keywords.push('under-5-lakh');
      else if (price < 1000000) keywords.push('under-10-lakh');
      else if (price < 2000000) keywords.push('under-20-lakh');
      else keywords.push('above-20-lakh');
    }

    if (listingData.postedByType) {
      keywords.push(listingData.postedByType.toLowerCase());
    }

    if (categorySpecificData) {
      if (categorySpecificData.brand) keywords.push(categorySpecificData.brand.toLowerCase());
      if (categorySpecificData.model) keywords.push(categorySpecificData.model.toLowerCase());
      if (categorySpecificData.variant) keywords.push(categorySpecificData.variant.toLowerCase());
      if (categorySpecificData.fuelType) keywords.push(categorySpecificData.fuelType.toLowerCase());
      if (categorySpecificData.transmission) keywords.push(categorySpecificData.transmission.toLowerCase());
      if (categorySpecificData.year) keywords.push(categorySpecificData.year.toString());
      if (categorySpecificData.color) keywords.push(categorySpecificData.color.toLowerCase());
      if (categorySpecificData.bodyType) keywords.push(categorySpecificData.bodyType.toLowerCase());

      if (categorySpecificData.propertyType) keywords.push(categorySpecificData.propertyType.toLowerCase());
      if (categorySpecificData.bedrooms) keywords.push(`${categorySpecificData.bedrooms}bhk`);
      if (categorySpecificData.bathrooms) keywords.push(`${categorySpecificData.bathrooms}bathroom`);
      if (categorySpecificData.furnishingStatus) keywords.push(categorySpecificData.furnishingStatus.toLowerCase());
      if (categorySpecificData.facing) keywords.push(`${categorySpecificData.facing}-facing`);
      if (categorySpecificData.floorNumber) keywords.push(`floor-${categorySpecificData.floorNumber}`);
    }

    return [...new Set(keywords.filter(Boolean))].join(' ');
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