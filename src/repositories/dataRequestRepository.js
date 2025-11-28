import DataRequest from '#models/DataRequest.js';
import CarBrand from '#models/CarBrand.js';
import CarModel from '#models/CarModel.js';
import CarVariant from '#models/CarVariant.js';
import State from '#models/State.js';
import City from '#models/City.js';
import models from '#models/index.js';
import { Op } from 'sequelize';

const { User } = models;

class DataRequestRepository {
  async create(requestData) {
    return await DataRequest.create(requestData);
  }

  async findById(id) {
    return await DataRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'mobile', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'fullName', 'mobile', 'email']
        },
        {
          model: CarBrand,
          as: 'createdBrand',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: CarModel,
          as: 'createdModel',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: CarVariant,
          as: 'createdVariant',
          attributes: ['id', 'variantName', 'slug']
        },
        {
          model: State,
          as: 'createdState',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: City,
          as: 'createdCity',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  async findAllWithFilters({ userId, status, requestType, search, startDate, endDate, page = 1, limit = 20 }) {
    const where = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (requestType) where.requestType = requestType;

    // Search across brand_name, model_name, variant_name, state_name, city_name
    if (search) {
      where[Op.or] = [
        { brandName: { [Op.iLike]: `%${search}%` } },
        { modelName: { [Op.iLike]: `%${search}%` } },
        { variantName: { [Op.iLike]: `%${search}%` } },
        { stateName: { [Op.iLike]: `%${search}%` } },
        { cityName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;

    // Build user search condition
    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows, count } = await DataRequest.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'mobile', 'email'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
          required: Object.keys(userWhere).length > 0
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'fullName', 'mobile', 'email']
        },
        {
          model: CarBrand,
          as: 'createdBrand',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: CarModel,
          as: 'createdModel',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: CarVariant,
          as: 'createdVariant',
          attributes: ['id', 'variantName', 'slug']
        },
        {
          model: State,
          as: 'createdState',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: City,
          as: 'createdCity',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      requests: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async update(id, updateData, options = {}) {
    const request = await DataRequest.findByPk(id, options);
    if (!request) return null;
    
    await request.update(updateData, options);
    return await this.findById(id);
  }

  async checkDuplicate({ brandName, modelName, variantName, stateName, cityName, requestType }) {
    const where = {
      status: 'pending',
      requestType
    };

    // Car data duplicates
    if (requestType === 'brand' && brandName) {
      where.brandName = { [Op.iLike]: brandName };
    }

    if (requestType === 'model' && brandName && modelName) {
      where.brandName = { [Op.iLike]: brandName };
      where.modelName = { [Op.iLike]: modelName };
    }

    if (requestType === 'variant' && brandName && modelName && variantName) {
      where.brandName = { [Op.iLike]: brandName };
      where.modelName = { [Op.iLike]: modelName };
      where.variantName = { [Op.iLike]: variantName };
    }

    // Location duplicates
    if (requestType === 'state' && stateName) {
      where.stateName = { [Op.iLike]: stateName };
    }

    if (requestType === 'city' && stateName && cityName) {
      where.stateName = { [Op.iLike]: stateName };
      where.cityName = { [Op.iLike]: cityName };
    }

    return await DataRequest.findOne({ where });
  }

  async getStatistics() {
    const total = await DataRequest.count();
    const pending = await DataRequest.count({ where: { status: 'pending' } });
    const approved = await DataRequest.count({ where: { status: 'approved' } });
    const rejected = await DataRequest.count({ where: { status: 'rejected' } });

    const byType = await DataRequest.findAll({
      attributes: [
        'requestType',
        [DataRequest.sequelize.fn('COUNT', DataRequest.sequelize.col('id')), 'count']
      ],
      group: ['requestType']
    });

    return {
      total,
      pending,
      approved,
      rejected,
      byType: byType.reduce((acc, item) => {
        acc[item.requestType] = parseInt(item.get('count'));
        return acc;
      }, {})
    };
  }
}

export default new DataRequestRepository();
