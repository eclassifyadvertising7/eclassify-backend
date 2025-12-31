class LocationHelper {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get location hierarchy score
   * @param {Object} userLocation - User location
   * @param {Object} listingLocation - Listing location
   * @returns {Object} Location match info
   */
  static getLocationMatch(userLocation, listingLocation) {
    if (!userLocation || !listingLocation) {
      return { type: 'unknown', score: 0 };
    }

    // Same city
    if (userLocation.cityId === listingLocation.cityId) {
      return { type: 'same_city', score: 50 };
    }

    // Same state
    if (userLocation.stateId === listingLocation.stateId) {
      return { type: 'same_state', score: 25 };
    }

    // Different state
    return { type: 'different_state', score: 0 };
  }

  /**
   * Get distance-based score
   * @param {number} distance - Distance in kilometers
   * @returns {number} Distance score (0-30)
   */
  static getDistanceScore(distance) {
    if (!distance) return 0;

    if (distance <= 5) return 30;      // Within 5km
    if (distance <= 10) return 25;     // Within 10km
    if (distance <= 25) return 20;     // Within 25km
    if (distance <= 50) return 15;     // Within 50km
    if (distance <= 100) return 10;    // Within 100km
    return 5;                          // Beyond 100km
  }

  /**
   * Parse user location from request with proper priority fallback
   * @param {Object} req - Express request object
   * @returns {Object|null} User location data with source info
   */
  static parseUserLocation(req) {
    // Priority 1: User preferred location (manually set in query/body)
    // This is when user explicitly selects a location for search
    if (req.query.preferredStateId && req.query.preferredCityId) {
      return {
        stateId: parseInt(req.query.preferredStateId),
        cityId: parseInt(req.query.preferredCityId),
        latitude: req.query.preferredLatitude ? parseFloat(req.query.preferredLatitude) : null,
        longitude: req.query.preferredLongitude ? parseFloat(req.query.preferredLongitude) : null,
        source: 'user_preferred',
        priority: 1
      };
    }

    // Also check in request body for preferred location (for POST requests)
    if (req.body && req.body.preferredLocation && req.body.preferredLocation.stateId && req.body.preferredLocation.cityId) {
      return {
        stateId: parseInt(req.body.preferredLocation.stateId),
        cityId: parseInt(req.body.preferredLocation.cityId),
        latitude: req.body.preferredLocation.latitude ? parseFloat(req.body.preferredLocation.latitude) : null,
        longitude: req.body.preferredLocation.longitude ? parseFloat(req.body.preferredLocation.longitude) : null,
        source: 'user_preferred',
        priority: 1
      };
    }

    // Priority 2: Browser provided location (GPS/geolocation)
    // This comes from navigator.geolocation API
    if (req.query.browserLatitude && req.query.browserLongitude) {
      return {
        stateId: null, // Would need reverse geocoding to get state/city
        cityId: null,
        latitude: parseFloat(req.query.browserLatitude),
        longitude: parseFloat(req.query.browserLongitude),
        source: 'browser_geolocation',
        priority: 2,
        needsReverseGeocoding: true
      };
    }

    // Also check in request body for browser location (for POST requests)
    if (req.body && req.body.browserLocation && req.body.browserLocation.latitude && req.body.browserLocation.longitude) {
      return {
        stateId: null,
        cityId: null,
        latitude: parseFloat(req.body.browserLocation.latitude),
        longitude: parseFloat(req.body.browserLocation.longitude),
        source: 'browser_geolocation',
        priority: 2,
        needsReverseGeocoding: true
      };
    }

    // Priority 3: User's profile city coordinates
    // From authenticated user's profile
    if (req.user && req.user.stateId && req.user.cityId) {
      return {
        stateId: req.user.stateId,
        cityId: req.user.cityId,
        latitude: req.user.latitude || null,
        longitude: req.user.longitude || null,
        source: 'user_profile',
        priority: 3
      };
    }

    // Priority 4: IP-based location detection (from request headers)
    const ipLocation = this.getLocationFromIP(req);
    if (ipLocation) {
      return {
        stateId: ipLocation.stateId,
        cityId: ipLocation.cityId,
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
        source: 'ip_geolocation',
        priority: 4,
        accuracy: ipLocation.accuracy || 'city' // city, region, country
      };
    }

    // Priority 5: Fallback to query parameters (for backward compatibility)
    if (req.query.stateId && req.query.cityId) {
      return {
        stateId: parseInt(req.query.stateId),
        cityId: parseInt(req.query.cityId),
        latitude: req.query.latitude ? parseFloat(req.query.latitude) : null,
        longitude: req.query.longitude ? parseFloat(req.query.longitude) : null,
        source: 'query_params',
        priority: 5
      };
    }

    // Priority 6: No location available - return null for generalized listings
    return null;
  }

  /**
   * Get location from IP address using request headers
   * @param {Object} req - Express request object
   * @returns {Object|null} IP-based location data
   */
  static getLocationFromIP(req) {
    try {
      // Get client IP address
      const clientIP = this.getClientIP(req);
      
      if (!clientIP || this.isPrivateIP(clientIP)) {
        return null;
      }

      // Check for existing IP geolocation headers (from CDN/proxy)
      const geoHeaders = this.extractGeoHeaders(req);
      if (geoHeaders) {
        return geoHeaders;
      }

      // For now, return null - implement actual IP geolocation service integration
      // This would integrate with services like:
      // - MaxMind GeoIP2
      // - IPinfo.io
      // - ip-api.com
      // - CloudFlare geolocation headers
      
      console.log(`IP geolocation needed for IP: ${clientIP}`);
      return null;
    } catch (error) {
      console.error('IP geolocation failed:', error);
      return null;
    }
  }

  /**
   * Extract client IP address from request
   * @param {Object} req - Express request object
   * @returns {string|null} Client IP address
   */
  static getClientIP(req) {
    // Check various headers for real IP (in order of preference)
    const ipHeaders = [
      'cf-connecting-ip',     // Cloudflare
      'x-real-ip',           // Nginx
      'x-forwarded-for',     // Standard proxy header
      'x-client-ip',         // Apache
      'x-forwarded',         // General
      'forwarded-for',       // RFC 7239
      'forwarded'            // RFC 7239
    ];

    for (const header of ipHeaders) {
      const ip = req.headers[header];
      if (ip) {
        // x-forwarded-for can contain multiple IPs, take the first one
        const firstIP = ip.split(',')[0].trim();
        if (this.isValidIP(firstIP)) {
          return firstIP;
        }
      }
    }

    // Fallback to connection remote address
    return req.connection?.remoteAddress || req.socket?.remoteAddress || null;
  }

  /**
   * Extract geolocation data from request headers (CDN/proxy provided)
   * @param {Object} req - Express request object
   * @returns {Object|null} Geolocation data from headers
   */
  static extractGeoHeaders(req) {
    const headers = req.headers;

    // Cloudflare geolocation headers
    if (headers['cf-ipcountry'] && headers['cf-ipcity']) {
      return {
        countryCode: headers['cf-ipcountry'],
        cityName: headers['cf-ipcity'],
        regionName: headers['cf-ipregion'],
        latitude: headers['cf-iplatitude'] ? parseFloat(headers['cf-iplatitude']) : null,
        longitude: headers['cf-iplongitude'] ? parseFloat(headers['cf-iplongitude']) : null,
        source: 'cloudflare_headers',
        accuracy: 'city'
      };
    }

    // AWS CloudFront geolocation headers
    if (headers['cloudfront-viewer-country'] && headers['cloudfront-viewer-city']) {
      return {
        countryCode: headers['cloudfront-viewer-country'],
        cityName: headers['cloudfront-viewer-city'],
        regionName: headers['cloudfront-viewer-region'],
        latitude: headers['cloudfront-viewer-latitude'] ? parseFloat(headers['cloudfront-viewer-latitude']) : null,
        longitude: headers['cloudfront-viewer-longitude'] ? parseFloat(headers['cloudfront-viewer-longitude']) : null,
        source: 'cloudfront_headers',
        accuracy: 'city'
      };
    }

    // Custom geolocation headers (if you implement your own middleware)
    if (headers['x-geo-country'] && headers['x-geo-city']) {
      return {
        countryCode: headers['x-geo-country'],
        cityName: headers['x-geo-city'],
        regionName: headers['x-geo-region'],
        latitude: headers['x-geo-latitude'] ? parseFloat(headers['x-geo-latitude']) : null,
        longitude: headers['x-geo-longitude'] ? parseFloat(headers['x-geo-longitude']) : null,
        source: 'custom_headers',
        accuracy: 'city'
      };
    }

    return null;
  }

  /**
   * Check if IP address is valid
   * @param {string} ip - IP address
   * @returns {boolean} Whether IP is valid
   */
  static isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Check if IP address is private/local
   * @param {string} ip - IP address
   * @returns {boolean} Whether IP is private
   */
  static isPrivateIP(ip) {
    const privateRanges = [
      /^10\./,                    // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./,              // 192.168.0.0/16
      /^127\./,                   // 127.0.0.0/8 (localhost)
      /^::1$/,                    // IPv6 localhost
      /^fc00:/,                   // IPv6 private
      /^fe80:/                    // IPv6 link-local
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Get location with fallback chain
   * @param {Object} req - Express request object
   * @param {Object} options - Options for location parsing
   * @returns {Object} Location result with fallback info
   */
  static getLocationWithFallback(req, options = {}) {
    const location = this.parseUserLocation(req);
    
    if (!location) {
      return {
        location: null,
        source: 'no_location',
        priority: 6,
        useGeneralizedListings: true,
        message: 'No location available, showing generalized listings'
      };
    }

    // If browser location needs reverse geocoding
    if (location.needsReverseGeocoding) {
      return {
        location,
        source: location.source,
        priority: location.priority,
        needsProcessing: true,
        message: 'Browser location detected, reverse geocoding needed'
      };
    }

    return {
      location,
      source: location.source,
      priority: location.priority,
      message: `Location detected from ${location.source}`
    };
  }

  /**
   * Reverse geocode coordinates to get state/city IDs
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object|null>} State and city IDs
   */
  static async reverseGeocode(latitude, longitude) {
    // This would integrate with a geocoding service (Google Maps, OpenStreetMap, etc.)
    // For now, return null - implement when geocoding service is available
    
    try {
      // Placeholder for actual geocoding implementation
      // const result = await geocodingService.reverseGeocode(latitude, longitude);
      // return {
      //   stateId: result.stateId,
      //   cityId: result.cityId,
      //   stateName: result.stateName,
      //   cityName: result.cityName
      // };
      
      console.log(`Reverse geocoding needed for coordinates: ${latitude}, ${longitude}`);
      return null;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Get search location strategy based on available data
   * @param {Object} req - Express request object
   * @returns {Object} Search strategy with location info
   */
  static getSearchLocationStrategy(req) {
    const locationResult = this.getLocationWithFallback(req);
    
    const strategy = {
      hasLocation: !!locationResult.location,
      location: locationResult.location,
      source: locationResult.source,
      priority: locationResult.priority,
      searchType: 'generalized', // Default
      locationBonus: 0,
      message: locationResult.message
    };

    if (locationResult.location) {
      // Determine search type based on location source
      switch (locationResult.source) {
        case 'user_preferred':
          strategy.searchType = 'location_targeted';
          strategy.locationBonus = 50; // Highest bonus for user preferred
          break;
        case 'browser_geolocation':
          strategy.searchType = 'proximity_based';
          strategy.locationBonus = 40; // High bonus for GPS location
          break;
        case 'user_profile':
          strategy.searchType = 'profile_based';
          strategy.locationBonus = 30; // Medium bonus for profile location
          break;
        case 'ip_geolocation':
          strategy.searchType = 'ip_based';
          strategy.locationBonus = 20; // Medium-low bonus for IP location
          break;
        case 'query_params':
          strategy.searchType = 'filtered';
          strategy.locationBonus = 10; // Lower bonus for query params
          break;
      }
    }

    return strategy;
  }

  /**
   * Format location string for display
   * @param {Object} location - Location object with city and state
   * @returns {string} Formatted location string
   */
  static formatLocationString(location) {
    const parts = [];
    
    if (location.locality) parts.push(location.locality);
    if (location.cityName) parts.push(location.cityName);
    if (location.stateName) parts.push(location.stateName);
    
    return parts.join(', ');
  }

  /**
   * Get nearby cities for expanded search
   * @param {number} cityId - Base city ID
   * @returns {Array} Array of nearby city IDs
   */
  static getNearbyCities(cityId) {
    // This would typically query a cities distance table
    // For now, return the same city
    return [cityId];
  }

  /**
   * Validate location coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {boolean} Whether coordinates are valid
   */
  static isValidCoordinates(latitude, longitude) {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }
}

export default LocationHelper;