import scoringLogger from '#utils/loggers/scoringLogger.js';

class LocationHelper {

  static parseOLALocation(olaResponse, requestId = null) {
    try {
      if (!olaResponse || !olaResponse.secondary_text) {
        return null;
      }

      const parts = olaResponse.secondary_text.split(',').map(p => p.trim());
      
      const result = {
        locality: null,
        city: null,
        state: null,
        pincode: null,
        placeId: olaResponse.place_id || null,
        reference: olaResponse.reference || null,
        placeName: olaResponse.place_name || null,
        latitude: olaResponse.geometry?.location?.lat || null,
        longitude: olaResponse.geometry?.location?.lng || null,
        formattedAddress: olaResponse.secondary_text || null
      };

      if (parts.length >= 1) {
        const lastPart = parts[parts.length - 1];
        if (/^\d{6}$/.test(lastPart)) {
          result.pincode = lastPart;
          parts.pop();
        }
      }

      if (parts.length >= 1) {
        result.state = parts[parts.length - 1];
      }

      if (parts.length >= 2) {
        result.city = parts[parts.length - 2];
      }

      if (parts.length >= 3) {
        result.locality = parts.slice(0, parts.length - 2).join(', ');
      }

      return result;
    } catch (error) {
      console.error('Error parsing OLA location:', error);
      return null;
    }
  }

  static parseGoogleLocation(googleResponse) {
    try {
      if (!googleResponse || !googleResponse.addressComponents) {
        return null;
      }

      const result = {
        locality: null,
        city: null,
        district: null,
        state: null,
        country: null,
        pincode: null,
        externalId: googleResponse.id ? String(googleResponse.id) : null,
        providerNumericId: googleResponse.id || null,
        parentId: googleResponse.parentId || null,
        name: googleResponse.name || null,
        type: googleResponse.type || null,
        latitude: googleResponse.latitude || null,
        longitude: googleResponse.longitude || null,
        formattedAddress: googleResponse.formattedAddress || null
      };

      const components = googleResponse.addressComponents || [];
      
      for (const component of components) {
        const type = component.type?.toLowerCase();
        const longName = component.longName;
        const shortName = component.shortName;

        switch (type) {
          case 'country':
            result.country = longName;
            break;
          case 'administrative_area_level_1':
            result.state = longName;
            break;
          case 'administrative_area_level_2':
            result.district = longName;
            break;
          case 'locality':
          case 'city':
            result.city = longName;
            break;
          case 'sublocality':
          case 'sublocality_level_1':
          case 'neighbourhood':
            result.locality = longName;
            break;
          case 'postal_code':
            result.pincode = shortName;
            break;
        }
      }

      return result;
    } catch (error) {
      console.error('Error parsing Google location:', error);
      return null;
    }
  }

  static async matchLocationToDatabase(city, state) {
    try {
      const { default: models } = await import('#models/index.js');
      const { State, City } = models;
      const { Op } = await import('sequelize');

      if (!state) {
        return { stateId: null, cityId: null, confidence: 0 };
      }

      const stateMatch = await State.findOne({
        where: {
          name: {
            [Op.iLike]: `%${state}%`
          }
        },
        attributes: ['id', 'name']
      });

      if (!stateMatch) {
        return { stateId: null, cityId: null, confidence: 0 };
      }

      if (!city) {
        return { stateId: stateMatch.id, cityId: null, confidence: 0.7 };
      }

      const cityMatch = await City.findOne({
        where: {
          stateId: stateMatch.id,
          name: {
            [Op.iLike]: `%${city}%`
          }
        },
        attributes: ['id', 'name']
      });

      if (cityMatch) {
        return { 
          stateId: stateMatch.id, 
          cityId: cityMatch.id, 
          confidence: 0.95 
        };
      }

      return { stateId: stateMatch.id, cityId: null, confidence: 0.7 };
    } catch (error) {
      console.error('Error matching location to database:', error);
      return { stateId: null, cityId: null, confidence: 0 };
    }
  }


  static async parseUserLocation(req) {
    // Priority 1: Request query parameters (preferredLatitude/preferredLongitude)
    if (req.query.preferredLatitude && req.query.preferredLongitude) {
      scoringLogger.debug('Location from request query', {
        latitude: req.query.preferredLatitude,
        longitude: req.query.preferredLongitude,
        source: 'user_preferred'
      });

      return {
        latitude: parseFloat(req.query.preferredLatitude),
        longitude: parseFloat(req.query.preferredLongitude),
        source: 'user_preferred',
        priority: 1
      };
    }

    // Also check in request body for preferred location (for POST requests)
    if (req.body && req.body.preferredLocation && req.body.preferredLocation.latitude && req.body.preferredLocation.longitude) {
      scoringLogger.debug('Location from request body', {
        latitude: req.body.preferredLocation.latitude,
        longitude: req.body.preferredLocation.longitude,
        source: 'user_preferred'
      });

      return {
        latitude: parseFloat(req.body.preferredLocation.latitude),
        longitude: parseFloat(req.body.preferredLocation.longitude),
        source: 'user_preferred',
        priority: 1
      };
    }

    // Priority 2: User's profile location (fallback when frontend doesn't send location)
    if (req.user && req.user.userId) {
      try {
        const { default: models } = await import('#models/index.js');
        const { UserProfile } = models;
        
        const userProfile = await UserProfile.findOne({
          where: { userId: req.user.userId },
          attributes: [
            'preferredLatitude',
            'preferredLongitude',
            'latitude',
            'longitude'
          ],
          raw: true
        });

        if (userProfile) {
          // Prefer preferred location if set
          if (userProfile.preferredLatitude && userProfile.preferredLongitude) {
            scoringLogger.debug('Location from user profile (preferred)', {
              latitude: userProfile.preferredLatitude,
              longitude: userProfile.preferredLongitude,
              source: 'user_profile',
              userId: req.user.userId
            });

            return {
              latitude: parseFloat(userProfile.preferredLatitude),
              longitude: parseFloat(userProfile.preferredLongitude),
              source: 'user_profile',
              priority: 2
            };
          }
          
          // Fallback to actual profile location
          if (userProfile.latitude && userProfile.longitude) {
            scoringLogger.debug('Location from user profile (actual)', {
              latitude: userProfile.latitude,
              longitude: userProfile.longitude,
              source: 'user_profile',
              userId: req.user.userId
            });

            return {
              latitude: parseFloat(userProfile.latitude),
              longitude: parseFloat(userProfile.longitude),
              source: 'user_profile',
              priority: 2
            };
          }
        }
      } catch (error) {
        console.error('Error fetching user profile for location:', error);
      }
    }

    // No location available - return null for generalized listings
    scoringLogger.debug('No location available', {
      hasQuery: !!(req.query.preferredLatitude || req.query.preferredLongitude),
      hasUser: !!req.user
    });

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
   * @returns {Promise<Object>} Location result with fallback info
   */
  static async getLocationWithFallback(req, options = {}) {
    const location = await this.parseUserLocation(req);
    
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
   * @returns {Promise<Object>} Search strategy with location info
   */
  static async getSearchLocationStrategy(req) {
    const locationResult = await this.getLocationWithFallback(req);
    
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