class ScoringHelper {
  static calculateLocationScore(userLocation, listingLocation) {
    if (!userLocation || !listingLocation) return 0;

    let baseScore = 0;

    // Same city - highest score
    if (userLocation.cityId === listingLocation.cityId) {
      baseScore = 50;
    } 
    // Same state but different city - check distance if coordinates available
    else if (userLocation.stateId === listingLocation.stateId) {
      // If both have coordinates, use distance-based scoring
      if (userLocation.latitude && userLocation.longitude && 
          listingLocation.latitude && listingLocation.longitude) {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          listingLocation.latitude,
          listingLocation.longitude
        );
        
        // Distance-based scoring within same state
        if (distance <= 10) baseScore = 40;        // Within 10km
        else if (distance <= 25) baseScore = 35;   // Within 25km
        else if (distance <= 50) baseScore = 30;   // Within 50km
        else if (distance <= 100) baseScore = 25;  // Within 100km
        else if (distance <= 200) baseScore = 20;  // Within 200km
        else baseScore = 15;                       // Beyond 200km but same state
      } else {
        // No coordinates, just same state
        baseScore = 25;
      }
    } 
    // Different state
    else {
      baseScore = 0;
    }

    // Apply multiplier based on source
    let multiplier = 1.0;
    
    if (userLocation.source) {
      switch (userLocation.source) {
        case 'user_preferred':
          multiplier = 1.0;
          break;
        case 'user_profile':
          multiplier = 0.7;
          break;
        default:
          multiplier = 0.7;
      }
    }

    return Math.round(baseScore * multiplier);
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  static calculatePaidListingScore(isPaidListing) {
    return isPaidListing ? 30 : 0;
  }

  static calculateFeaturedScore(isFeatured, featuredUntil) {
    if (!isFeatured) return 0;
    
    if (featuredUntil && new Date() > new Date(featuredUntil)) {
      return 0;
    }

    return 20;
  }

  static calculateFreshnessScore(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) return 10;
    if (daysDiff <= 7) return 7;
    if (daysDiff <= 30) return 5;
    return 0;
  }

  static calculateTotalScore(listingData, context = {}) {
    const {
      stateId,
      cityId,
      latitude,
      longitude,
      isPaidListing = false,
      isFeatured = false,
      featuredUntil = null,
      createdAt,
      created_at // Fallback for snake_case from database
    } = listingData;

    const { userLocation = null } = context;

    // Use createdAt or created_at (fallback)
    const timestamp = createdAt || created_at;
    
    if (!timestamp) {
      throw new Error('createdAt is required for scoring');
    }

    const scores = {
      location: this.calculateLocationScore(userLocation, { stateId, cityId, latitude, longitude }),
      paid: this.calculatePaidListingScore(isPaidListing),
      featured: this.calculateFeaturedScore(isFeatured, featuredUntil),
      freshness: this.calculateFreshnessScore(timestamp)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      totalScore,
      breakdown: scores
    };
  }

  static sortListings(listings) {
    return listings.sort((a, b) => {
      const aFeatured = a.isFeatured && (!a.featuredUntil || new Date() <= new Date(a.featuredUntil));
      const bFeatured = b.isFeatured && (!b.featuredUntil || new Date() <= new Date(b.featuredUntil));
      
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      
      return b.totalScore - a.totalScore;
    });
  }

  static sortListingsWithPrimary(listings, sortBy = 'relevance') {
    return listings.sort((a, b) => {
      let primaryComparison = 0;

      switch (sortBy) {
        case 'relevance':
          primaryComparison = (b.totalScore || 0) - (a.totalScore || 0);
          if (primaryComparison !== 0) return primaryComparison;
          return (b.id || 0) - (a.id || 0);

        case 'views':
          primaryComparison = (b.viewCount || 0) - (a.viewCount || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'favorites':
          primaryComparison = (b.totalFavorites || 0) - (a.totalFavorites || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'price_low':
        case 'price_asc':
          primaryComparison = (a.price || 0) - (b.price || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'price_high':
        case 'price_desc':
          primaryComparison = (b.price || 0) - (a.price || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'date_new':
        case 'date_desc':
          const aDate = new Date(a.createdAt || a.created_at || 0);
          const bDate = new Date(b.createdAt || b.created_at || 0);
          primaryComparison = bDate - aDate;
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'date_old':
        case 'date_asc':
          const aDateOld = new Date(a.createdAt || a.created_at || 0);
          const bDateOld = new Date(b.createdAt || b.created_at || 0);
          primaryComparison = aDateOld - bDateOld;
          if (primaryComparison !== 0) return primaryComparison;
          break;

        default:
          primaryComparison = (b.totalScore || 0) - (a.totalScore || 0);
          if (primaryComparison !== 0) return primaryComparison;
          return (b.id || 0) - (a.id || 0);
      }

      const scoreComparison = (b.totalScore || 0) - (a.totalScore || 0);
      if (scoreComparison !== 0) return scoreComparison;

      return (b.id || 0) - (a.id || 0);
    });
  }

  static calculateSimilarityScore(listing, referenceListing) {
    let score = 0;

    if (listing.categoryId === referenceListing.categoryId) {
      score += 40;
    }

    const priceRatio = Math.min(listing.price, referenceListing.price) / 
                       Math.max(listing.price, referenceListing.price);
    if (priceRatio >= 0.7) {
      score += 30 * priceRatio;
    }

    if (listing.cityId === referenceListing.cityId) {
      score += 20;
    } else if (listing.stateId === referenceListing.stateId) {
      score += 10;
    }

    if (listing.postedByType === referenceListing.postedByType) {
      score += 10;
    }

    return Math.min(Math.round(score), 100);
  }
}

export default ScoringHelper;
