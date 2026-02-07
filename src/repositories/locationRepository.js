import db from '#models/index.js';
import { Op } from 'sequelize';

const { State, City } = db;

/**
 * Location Repository
 * Handles database operations for states and cities
 */
class LocationRepository {
  /**
   * Get all active states
   * @returns {Promise<Array>}
   */
  async getAllStates() {
    return await State.findAll({
      where: {
        isActive: true,
        isDeleted: false
      },
      attributes: ['id', 'slug', 'name', 'regionSlug', 'regionName'],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Get state by ID
   * @param {number} stateId
   * @returns {Promise<Object|null>}
   */
  async getStateById(stateId) {
    return await State.findOne({
      where: {
        id: stateId,
        isActive: true,
        isDeleted: false
      },
      attributes: ['id', 'slug', 'name', 'regionSlug', 'regionName']
    });
  }

  /**
   * Get cities by state ID
   * @param {number} stateId
   * @returns {Promise<Array>}
   */
  async getCitiesByStateId(stateId) {
    return await City.findAll({
      where: {
        stateId,
        isActive: true,
        isDeleted: false
      },
      attributes: [
        'id',
        'name',
        'district',
        'stateName',
        'pincode',
        'latitude',
        'longitude'
      ],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Get all cities irrespective of state
   * @returns {Promise<Array>}
   */
  async getAllCities() {
    return await City.findAll({
      where: {
        isActive: true,
        isDeleted: false
      },
      attributes: [
        'id',
        'name',
        'district',
        'stateName',
        'pincode',
        'locality',
        'latitude',
        'longitude'
      ],
      order: [['stateName', 'ASC'], ['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  async getPopularCities() {
    return await City.findAll({
      where: {
        isPopular: true,
        isActive: true,
        isDeleted: false
      },
      attributes: [
        'id',
        'name',
        'slug',
        'district',
        'stateName',
        'stateId',
        'pincode',
        'locality',
        'latitude',
        'longitude',
        'displayOrder'
      ],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  async searchCities(query, stateId = null, limit = 10) {
    const whereClause = {
      isActive: true,
      isDeleted: false,
      [Op.or]: [
        {
          locality: {
            [Op.iLike]: `%${query}%`
          }
        },
        {
          name: {
            [Op.iLike]: `%${query}%`
          }
        }
      ]
    };

    if (stateId) {
      whereClause.stateId = stateId;
    }

    const cities = await City.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'slug',
        'district',
        'stateName',
        'stateId',
        'pincode',
        'locality',
        'latitude',
        'longitude',
        'isPopular'
      ],
      limit: limit * 2
    });

    const sortedCities = cities.sort((a, b) => {
      const aLocalityMatch = a.locality?.toLowerCase().includes(query.toLowerCase());
      const bLocalityMatch = b.locality?.toLowerCase().includes(query.toLowerCase());
      
      if (aLocalityMatch && !bLocalityMatch) return -1;
      if (!aLocalityMatch && bLocalityMatch) return 1;
      
      if (b.isPopular !== a.isPopular) {
        return b.isPopular ? 1 : -1;
      }
      
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      
      return a.name.localeCompare(b.name);
    });

    return sortedCities.slice(0, limit);
  }

  async getNearbyCities(lat, lng, radius) {
    const cities = await City.findAll({
      where: {
        isActive: true,
        isDeleted: false,
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      },
      attributes: [
        'id',
        'name',
        'slug',
        'district',
        'stateName',
        'stateId',
        'pincode',
        'locality',
        'latitude',
        'longitude',
        'isPopular'
      ]
    });

    const nearbyCities = cities
      .map(city => {
        const distance = this._calculateDistance(
          lat,
          lng,
          parseFloat(city.latitude),
          parseFloat(city.longitude)
        );
        return {
          ...city.toJSON(),
          distance: Math.round(distance * 10) / 10
        };
      })
      .filter(city => city.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return nearbyCities;
  }

  _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this._toRad(lat2 - lat1);
    const dLon = this._toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) *
        Math.cos(this._toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  _toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  async getCityById(cityId) {
    return await City.findOne({
      where: {
        id: cityId,
        isDeleted: false
      }
    });
  }

  async updateCityPopularity(cityId, isPopular, userId) {
    const city = await this.getCityById(cityId);
    if (!city) {
      return null;
    }

    await City.update(
      { 
        isPopular,
        updatedBy: userId
      },
      { 
        where: { id: cityId }
      }
    );

    return await this.getCityById(cityId);
  }

  async getAllStatesForAdmin(options = {}) {
    const { page = 1, limit = 50, search = '' } = options;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows } = await State.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'slug', 'name', 'regionSlug', 'regionName', 'displayOrder', 'isActive', 'isDeleted', ['created_at', 'createdAt'], ['updated_at', 'updatedAt']],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
      limit,
      offset
    });

    return {
      states: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    };
  }

  async getStateByIdForAdmin(stateId) {
    return await State.findOne({
      where: { id: stateId },
      attributes: ['id', 'slug', 'name', 'regionSlug', 'regionName', 'displayOrder', 'isActive', 'isDeleted', ['created_at', 'createdAt'], ['updated_at', 'updatedAt']]
    });
  }

  async getStateBySlug(slug) {
    return await State.findOne({
      where: { 
        slug,
        isDeleted: false
      },
      attributes: ['id', 'slug', 'name']
    });
  }

  async createState(stateData) {
    return await State.create(stateData);
  }

  async updateState(stateId, updateData, userId) {
    await State.update(
      { 
        ...updateData,
        updatedBy: userId
      },
      { 
        where: { id: stateId }
      }
    );

    return await this.getStateByIdForAdmin(stateId);
  }

  async deleteState(stateId, userId) {
    await State.update(
      { 
        isDeleted: true,
        deletedBy: userId,
        deletedAt: new Date()
      },
      { 
        where: { id: stateId }
      }
    );
  }

  async getAllCitiesForAdmin() {
    return await City.findAll({
      attributes: [
        'id',
        'name',
        'slug',
        'stateId',
        'stateName',
        'district',
        'districtId',
        'pincode',
        'latitude',
        'longitude',
        'displayOrder',
        'isActive',
        'isPopular',
        'isDeleted',
        ['created_at', 'createdAt'],
        ['updated_at', 'updatedAt']
      ],
      order: [['stateName', 'ASC'], ['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  async getCitiesByStateForAdmin(stateId, options = {}) {
    const { page = 1, limit = 50, search = '' } = options;
    const offset = (page - 1) * limit;

    const whereClause = { stateId };
    
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows } = await City.findAndCountAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'slug',
        'stateId',
        'stateName',
        'district',
        'districtId',
        'pincode',
        'latitude',
        'longitude',
        'displayOrder',
        'isActive',
        'isPopular',
        'isDeleted',
        ['created_at', 'createdAt'],
        ['updated_at', 'updatedAt']
      ],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
      limit,
      offset
    });

    return {
      cities: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    };
  }

  async getCityBySlug(slug) {
    return await City.findOne({
      where: { 
        slug,
        isDeleted: false
      },
      attributes: ['id', 'slug', 'name']
    });
  }

  async createCity(cityData) {
    return await City.create(cityData);
  }

  async updateCity(cityId, updateData, userId) {
    await City.update(
      { 
        ...updateData,
        updatedBy: userId
      },
      { 
        where: { id: cityId }
      }
    );

    return await this.getCityById(cityId);
  }

  async deleteCity(cityId, userId) {
    await City.update(
      { 
        isDeleted: true,
        deletedBy: userId,
        deletedAt: new Date()
      },
      { 
        where: { id: cityId }
      }
    );
  }
}

export default new LocationRepository();
