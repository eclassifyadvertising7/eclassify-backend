import db from '#models/index.js';

const { User, UserProfile, State, Role } = db;

/**
 * Profile Repository
 * Handles database operations for user profiles
 */
class ProfileRepository {
  /**
   * Get user with profile by user ID
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  async getUserWithProfile(userId) {
    return await User.findOne({
      where: { id: userId },
      attributes: [
        'id',
        'fullName',
        'countryCode',
        'mobile',
        'email',
        'status',
        'isPhoneVerified',
        'isEmailVerified',
        'kycStatus',
        'subscriptionType',
        'subscriptionExpiresAt'
      ],
      include: [
        {
          model: UserProfile,
          as: 'profile',
          attributes: [
            'id',
            'dob',
            'gender',
            'about',
            'addressLine1',
            'addressLine2',
            'city',
            'stateId',
            'stateName',
            'country',
            'pincode',
            'latitude',
            'longitude',
            'profilePhoto',
            'profilePhotoStorageType',
            'profilePhotoMimeType'
          ],
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name', 'slug']
            }
          ]
        },
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
  }

  /**
   * Get business/KYC info
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  async getBusinessInfo(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'fullName', 'kycStatus']
    });

    if (!user) return null;

    const profile = await UserProfile.findOne({
      where: { userId },
      attributes: [
        'id',
        'nameOnId',
        'businessName',
        'gstin',
        'aadharNumber',
        'panNumber'
      ]
    });

    return {
      user,
      profile
    };
  }

  /**
   * Update user basic info
   * @param {number} userId
   * @param {Object} data
   * @param {Object} transaction
   * @returns {Promise<Object>}
   */
  async updateUser(userId, data, transaction) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    await user.update(data, { transaction });
    return user;
  }

  /**
   * Update or create user profile
   * @param {number} userId
   * @param {Object} data
   * @param {Object} transaction
   * @returns {Promise<Object>}
   */
  async updateOrCreateProfile(userId, data, transaction) {
    const [profile] = await UserProfile.upsert(
      {
        userId,
        ...data
      },
      { transaction }
    );

    return profile;
  }

  /**
   * Update business/KYC info
   * @param {number} userId
   * @param {Object} data
   * @param {Object} transaction
   * @returns {Promise<Object>}
   */
  async updateBusinessInfo(userId, data, transaction) {
    const [profile] = await UserProfile.upsert(
      {
        userId,
        ...data
      },
      { transaction }
    );

    return profile;
  }

  /**
   * Check if profile exists
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  async profileExists(userId) {
    const count = await UserProfile.count({ where: { userId } });
    return count > 0;
  }
}

export default new ProfileRepository();
