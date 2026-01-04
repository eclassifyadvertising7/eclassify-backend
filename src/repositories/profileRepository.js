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
        'kycStatus'
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
            'cityId',
            'cityName',
            'stateId',
            'stateName',
            'country',
            'pincode',
            'latitude',
            'longitude',
            'profilePhoto',
            'profilePhotoStorageType',
            'profilePhotoMimeType'
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
  async updateOrCreateProfile(userId, data, transaction = null) {
    try {
      const options = transaction ? { transaction } : {};
      
      const existingProfile = await UserProfile.findOne({
        where: { userId },
        ...options
      });

      if (existingProfile) {
        await existingProfile.update(data, options);
        return existingProfile;
      } else {
        return await UserProfile.create(
          {
            userId,
            ...data
          },
          options
        );
      }
    } catch (error) {
      console.error('Error in updateOrCreateProfile:', error);
      throw error;
    }
  }

  /**
   * Update business/KYC info
   * @param {number} userId
   * @param {Object} data
   * @param {Object} transaction
   * @returns {Promise<Object>}
   */
  async updateBusinessInfo(userId, data, transaction = null) {
    const options = transaction ? { transaction } : {};
    
    const existingProfile = await UserProfile.findOne({
      where: { userId },
      ...options
    });

    if (existingProfile) {
      await existingProfile.update(data, options);
      return existingProfile;
    } else {
      return await UserProfile.create(
        {
          userId,
          ...data
        },
        options
      );
    }
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

  async getPreferredLocation(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'fullName']
    });

    if (!user) return null;

    const profile = await UserProfile.findOne({
      where: { userId },
      attributes: [
        'id',
        ['preferred_state_id', 'preferredStateId'],
        ['preferred_state_name', 'preferredStateName'],
        ['preferred_city_id', 'preferredCityId'],
        ['preferred_city_name', 'preferredCityName'],
        ['preferred_latitude', 'preferredLatitude'],
        ['preferred_longitude', 'preferredLongitude']
      ]
    });

    return {
      user,
      profile
    };
  }
}

export default new ProfileRepository();
