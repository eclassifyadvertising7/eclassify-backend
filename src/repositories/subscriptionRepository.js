import db from '#models/index.js';
import { Op } from 'sequelize';

const { SubscriptionPlan, UserSubscription, User } = db;

/**
 * SubscriptionRepository - Database operations for subscription plans and user subscriptions
 * Singleton pattern for consistent instance usage
 */
class SubscriptionRepository {
  // ==================== SUBSCRIPTION PLANS ====================

  /**
   * Create new subscription plan
   * @param {Object} planData - Plan data
   * @param {number} userId - Creator user ID
   * @param {string} userName - Creator user name
   * @returns {Promise<Object>} Created plan
   */
  async createPlan(planData, userId, userName) {
    return await SubscriptionPlan.create(planData, {
      userId,
      userName
    });
  }

  /**
   * Find plan by ID
   * @param {number} planId - Plan ID
   * @returns {Promise<Object|null>} Plan or null
   */
  async findPlanById(planId) {
    return await SubscriptionPlan.findByPk(planId, {
      include: [
        {
          model: SubscriptionPlan,
          as: 'replacementPlan',
          attributes: ['id', 'name', 'slug', 'finalPrice', 'version']
        }
      ]
    });
  }

  /**
   * Find plan by slug
   * @param {string} slug - Plan slug
   * @returns {Promise<Object|null>} Plan or null
   */
  async findPlanBySlug(slug) {
    return await SubscriptionPlan.findOne({
      where: { slug }
    });
  }

  /**
   * Find plan by plan code
   * @param {string} planCode - Plan code
   * @returns {Promise<Object|null>} Plan or null
   */
  async findPlanByCode(planCode) {
    return await SubscriptionPlan.findOne({
      where: { planCode }
    });
  }

  /**
   * Get all plans (including deprecated) - Admin view
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Plans
   */
  async getAllPlans(filters = {}) {
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.planCode) {
      where.planCode = filters.planCode;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    return await SubscriptionPlan.findAll({
      where,
      include: [
        {
          model: SubscriptionPlan,
          as: 'replacementPlan',
          attributes: ['id', 'name', 'slug', 'finalPrice', 'version']
        }
      ],
      order: [
        ['sort_order', 'ASC'],
        ['version', 'DESC'],
        ['created_at', 'DESC']
      ]
    });
  }

  /**
   * Get active public plans - End user view
   * @returns {Promise<Array>} Active public plans
   */
  async getActivePublicPlans() {
    return await SubscriptionPlan.findAll({
      where: {
        isActive: true,
        isPublic: true,
        deprecatedAt: null
      },
      order: [
        ['sort_order', 'ASC'],
        ['created_at', 'DESC']
      ]
    });
  }

  /**
   * Get plans by category - For listing subscriptions
   * @param {number} categoryId - Category ID
   * @returns {Promise<Array>} Category-specific plans
   */
  async getPlansByCategory(categoryId) {
    return await SubscriptionPlan.findAll({
      where: {
        categoryId,
        isActive: true,
        isPublic: true,
        deprecatedAt: null
      },
      order: [
        ['sort_order', 'ASC'],
        ['final_price', 'ASC']
      ]
    });
  }



  /**
   * Get free plan for category
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object|null>} Free plan for category
   */
  async getFreePlanForCategory(categoryId) {
    return await SubscriptionPlan.findOne({
      where: {
        categoryId,
        isFreePlan: true,
        isActive: true
      }
    });
  }

  /**
   * Get all active free plans (for all categories)
   * @returns {Promise<Array>} All free plans
   */
  async getAllFreePlans() {
    return await SubscriptionPlan.findAll({
      where: {
        isFreePlan: true,
        isActive: true
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['categoryId', 'ASC']]
    });
  }

  /**
   * Get all versions of a plan
   * @param {string} planCode - Plan code
   * @returns {Promise<Array>} All versions
   */
  async getPlanVersions(planCode) {
    return await SubscriptionPlan.findAll({
      where: { planCode },
      order: [['version', 'DESC']]
    });
  }

  /**
   * Update plan
   * @param {number} planId - Plan ID
   * @param {Object} updateData - Update data
   * @param {number} userId - Updater user ID
   * @param {string} userName - Updater user name
   * @returns {Promise<Object>} Updated plan
   */
  async updatePlan(planId, updateData, userId, userName) {
    const plan = await SubscriptionPlan.findByPk(planId);
    
    if (!plan) {
      return null;
    }

    await plan.update(updateData, {
      userId,
      userName
    });

    return await this.findPlanById(planId);
  }

  /**
   * Soft delete plan
   * @param {number} planId - Plan ID
   * @param {number} userId - Deleter user ID
   * @returns {Promise<boolean>} Success status
   */
  async deletePlan(planId, userId) {
    const plan = await SubscriptionPlan.findByPk(planId);
    
    if (!plan) {
      return false;
    }

    plan.deletedBy = userId;
    await plan.save();
    await plan.destroy();

    return true;
  }

  /**
   * Check if slug exists (excluding specific plan ID)
   * @param {string} slug - Slug to check
   * @param {number} excludePlanId - Plan ID to exclude
   * @returns {Promise<boolean>} True if exists
   */
  async slugExists(slug, excludePlanId = null) {
    const where = { slug };
    
    if (excludePlanId) {
      where.id = { [Op.ne]: excludePlanId };
    }

    const count = await SubscriptionPlan.count({ where });
    return count > 0;
  }

  // ==================== USER SUBSCRIPTIONS ====================

  /**
   * Create user subscription
   * @param {Object} subscriptionData - Subscription data
   * @param {number} userId - Creator user ID
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(subscriptionData, userId) {
    return await UserSubscription.create({
      ...subscriptionData,
      createdBy: userId
    });
  }

  /**
   * Find subscription by ID
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object|null>} Subscription or null
   */
  async findSubscriptionById(subscriptionId) {
    return await UserSubscription.findByPk(subscriptionId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'mobile', 'email']
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'slug', 'planCode', 'version']
        }
      ]
    });
  }

  /**
   * Get user's active subscription (legacy - use getUserActiveSubscriptionByCategory)
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Active subscription or null
   */
  async getUserActiveSubscription(userId) {
    return await UserSubscription.findOne({
      where: {
        userId,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'slug', 'planCode', 'version', 'deprecatedAt', 'replacedByPlanId']
        }
      ]
    });
  }

  /**
   * Get user's active subscription for specific category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object|null>} Active subscription for category or null
   */
  async getUserActiveSubscriptionByCategory(userId, categoryId) {
    return await UserSubscription.findOne({
      where: {
        userId,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          where: { categoryId },
          attributes: ['id', 'name', 'slug', 'planCode', 'version', 'categoryId', 'isFreePlan', 'isQuotaBased']
        }
      ]
    });
  }



  /**
   * Get all user's active subscriptions (all categories)
   * @param {number} userId - User ID
   * @returns {Promise<Array>} All active subscriptions
   */
  async getUserAllActiveSubscriptions(userId) {
    return await UserSubscription.findAll({
      where: {
        userId,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'slug', 'planCode', 'version', 'categoryId', 'isFreePlan', 'isQuotaBased']
        }
      ]
    });
  }

  /**
   * Get subscriptions by category (Admin)
   * @param {Object} filters - Filter options including categoryId
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Subscriptions with pagination
   */
  async getSubscriptionsByCategory(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;
    const where = {};
    const userWhere = {};
    const planWhere = {};

    // Category filter (required)
    if (filters.categoryId) {
      planWhere.categoryId = filters.categoryId;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // User filter
    if (filters.userId) {
      where.userId = filters.userId;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt[Op.gte] = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt[Op.lte] = new Date(filters.dateTo);
      }
    }

    // Search filter (name or mobile)
    if (filters.search) {
      userWhere[Op.or] = [
        { fullName: { [Op.iLike]: `%${filters.search}%` } },
        { mobile: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const { count, rows } = await UserSubscription.findAndCountAll({
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
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'slug', 'planCode', 'version', 'categoryId'],
          where: Object.keys(planWhere).length > 0 ? planWhere : undefined,
          required: true
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      subscriptions: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get user's subscription history
   * @param {number} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Subscriptions with pagination
   */
  async getUserSubscriptionHistory(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await UserSubscription.findAndCountAll({
      where: { userId },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'slug', 'planCode', 'version']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      subscriptions: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update subscription
   * @param {number} subscriptionId - Subscription ID
   * @param {Object} updateData - Update data
   * @param {number} userId - Updater user ID
   * @returns {Promise<Object>} Updated subscription
   */
  async updateSubscription(subscriptionId, updateData, userId) {
    const subscription = await UserSubscription.findByPk(subscriptionId);
    
    if (!subscription) {
      return null;
    }

    await subscription.update({
      ...updateData,
      updatedBy: userId
    });

    return await this.findSubscriptionById(subscriptionId);
  }

  /**
   * Check if user has active subscription
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if has active subscription
   */
  async hasActiveSubscription(userId) {
    const count = await UserSubscription.count({
      where: {
        userId,
        status: 'active'
      }
    });

    return count > 0;
  }

  /**
   * Count active subscriptions for a plan
   * @param {number} planId - Plan ID
   * @returns {Promise<number>} Count of active subscriptions
   */
  async countActiveSubscriptionsForPlan(planId) {
    return await UserSubscription.count({
      where: {
        planId,
        status: 'active'
      }
    });
  }

  /**
   * Get all user subscriptions with filters (Admin)
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Subscriptions with pagination
   */
  async getAllSubscriptions(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;
    const where = {};
    const userWhere = {};

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // User filter
    if (filters.userId) {
      where.userId = filters.userId;
    }

    // Plan filter
    if (filters.planId) {
      where.planId = filters.planId;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt[Op.gte] = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt[Op.lte] = new Date(filters.dateTo);
      }
    }

    // Search filter (name or mobile)
    if (filters.search) {
      userWhere[Op.or] = [
        { fullName: { [Op.iLike]: `%${filters.search}%` } },
        { mobile: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const { count, rows } = await UserSubscription.findAndCountAll({
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
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'slug', 'planCode', 'version']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      subscriptions: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Soft delete subscription
   * @param {number} subscriptionId - Subscription ID
   * @param {number} userId - Deleter user ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSubscription(subscriptionId, userId) {
    const subscription = await UserSubscription.findByPk(subscriptionId);
    
    if (!subscription) {
      return false;
    }

    subscription.deletedBy = userId;
    await subscription.save();
    await subscription.destroy();

    return true;
  }

  /**
   * Get subscription by ID with user details (Admin)
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object|null>} Subscription with details
   */
  async getSubscriptionWithDetails(subscriptionId) {
    return await UserSubscription.findByPk(subscriptionId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'mobile', 'email']
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'slug', 'planCode', 'version', 'finalPrice']
        },
        {
          model: UserSubscription,
          as: 'previousSubscription',
          attributes: ['id', 'planName', 'status', 'endsAt']
        }
      ]
    });
  }

}

// Export singleton instance
export default new SubscriptionRepository();
