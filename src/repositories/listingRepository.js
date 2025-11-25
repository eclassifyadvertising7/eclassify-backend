/**
 * Listing Repository
 * Handles database operations for listings
 */

import models from '#models/index.js';
import { Op } from 'sequelize';

const { Listing, CarListing, PropertyListing, ListingMedia, Category, State, City, User } = models;

class ListingRepository {
  /**
   * Create new listing
   * @param {Object} listingData - Listing data
   * @returns {Promise<Object>}
   */
  async create(listingData) {
    return await Listing.create(listingData);
  }

  /**
   * Get listing by ID with associations
   * @param {number} id - Listing ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async getById(id, options = {}) {
    const include = options.includeAll ? [
      { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'mobile'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: State, as: 'state', attributes: ['id', 'name', 'slug'] },
      { model: City, as: 'city', attributes: ['id', 'name', 'slug'] },
      { model: CarListing, as: 'carListing' },
      { model: PropertyListing, as: 'propertyListing' },
      { model: ListingMedia, as: 'media', order: [['displayOrder', 'ASC']] }
    ] : [];

    return await Listing.findByPk(id, {
      include,
      paranoid: options.includeDeleted ? false : true
    });
  }

  /**
   * Get listing by slug
   * @param {string} slug - Listing slug
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async getBySlug(slug, options = {}) {
    const include = options.includeAll ? [
      { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'mobile'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: State, as: 'state', attributes: ['id', 'name', 'slug'] },
      { model: City, as: 'city', attributes: ['id', 'name', 'slug'] },
      { model: CarListing, as: 'carListing' },
      { model: PropertyListing, as: 'propertyListing' },
      { model: ListingMedia, as: 'media', order: [['displayOrder', 'ASC']] }
    ] : [];

    return await Listing.findOne({
      where: { slug },
      include
    });
  }

  /**
   * Get all listings with filters and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}, pagination = {}) {
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
        attributes: ['id', 'mediaUrl', 'thumbnailUrl', 'mediaType']
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
          { model: CarVariant, as: 'variant', attributes: ['id', 'name'], required: false }
        ]
      });
    }

    // Property-specific filters
    const propertyWhere = {};
    if (filters.propertyType) propertyWhere.propertyType = filters.propertyType;
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
}

// Export singleton instance
export default new ListingRepository();
