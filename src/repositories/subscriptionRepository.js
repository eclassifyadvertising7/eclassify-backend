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
   * Get user's active subscription
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
}

// Export singleton instance
export default new SubscriptionRepository();
