import db from '#models/index.js';

/**
 * AuthRepository - Database operations for authentication
 * Singleton pattern for consistent instance usage
 */
class AuthRepository {
  /**
   * Find user by mobile number
   * @param {string} mobile - Mobile number
   * @returns {Promise<Object|null>} User object or null
   */
  async findByMobile(mobile) {
    return await db.User.findOne({
      where: { mobile },
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    return await db.User.findOne({
      where: { email },
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  /**
   * Find user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(userId) {
    return await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  /**
   * Create user session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Created session object
   */
  async createSession(sessionData) {
    return await db.UserSession.create(sessionData);
  }

  /**
   * Find active session by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object|null>} Session object or null
   */
  async findSessionByRefreshToken(refreshToken) {
    return await db.UserSession.findOne({
      where: { 
        refreshToken,
        isActive: true
      }
    });
  }

  /**
   * Invalidate session by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<void>}
   */
  async invalidateSession(refreshToken) {
    await db.UserSession.update(
      { isActive: false },
      { where: { refreshToken } }
    );
  }

  /**
   * Invalidate all user sessions
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async invalidateAllUserSessions(userId) {
    await db.UserSession.update(
      { isActive: false },
      { where: { userId } }
    );
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    return await db.User.create(userData);
  }

  async findByReferralCode(code) {
    return await db.User.findOne({
      where: { referralCode: code },
      attributes: ['id', 'mobile', 'email', 'fullName', 'referralCode']
    });
  }

  async incrementReferralCount(userId) {
    return await db.User.increment('referralCount', {
      where: { id: userId }
    });
  }

  async updateLastLogin(userId) {
    await db.User.update(
      { lastLoginAt: new Date() },
      { where: { id: userId } }
    );
  }

  /**
   * Get default user role (for new registrations)
   * @returns {Promise<Object|null>} Role object or null
   */
  async getDefaultRole() {
    return await db.Role.findOne({
      where: { slug: 'user', isActive: true }
    });
  }

  async findAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }

    return await db.User.findAll({
      where,
      attributes: ['id', 'fullName', 'email', 'mobile', 'status'],
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  async findByIds(userIds) {
    return await db.User.findAll({
      where: {
        id: userIds
      },
      attributes: ['id', 'fullName', 'email', 'mobile', 'status'],
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  async findByRole(roleSlug) {
    return await db.User.findAll({
      include: [
        {
          model: db.Role,
          as: 'role',
          where: { slug: roleSlug },
          attributes: ['id', 'name', 'slug']
        }
      ],
      attributes: ['id', 'fullName', 'email', 'mobile', 'status']
    });
  }

  async findBySubscriptionTier(subscriptionTier) {
    return await db.User.findAll({
      include: [
        {
          model: db.UserSubscription,
          as: 'activeSubscription',
          where: {
            tier: subscriptionTier,
            status: 'active'
          },
          required: true
        }
      ],
      attributes: ['id', 'fullName', 'email', 'mobile', 'status']
    });
  }

  async updatePassword(userId, passwordHash) {
    return await db.User.update(
      { passwordHash, isPasswordReset: true },
      { where: { id: userId } }
    );
  }
}

// Export singleton instance
export default new AuthRepository();
