import profileRepository from '#repositories/profileRepository.js';
import imageService from '#services/imageService.js';
import db from '#models/index.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

const { sequelize } = db;

/**
 * Profile Service
 * Business logic for user profile operations
 */
class ProfileService {
  /**
   * Get user profile
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    const user = await profileRepository.getUserWithProfile(userId);

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: user
    };
  }

  /**
   * Update user profile
   * @param {number} userId
   * @param {Object} profileData
   * @param {Object} file - Optional profile photo file
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, profileData, file = null) {
    const transaction = await sequelize.transaction();

    try {
      // Get existing user
      const existingUser = await profileRepository.getUserWithProfile(userId);
      if (!existingUser) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Prepare user update data
      const userData = {};
      if (profileData.fullName) userData.fullName = profileData.fullName;
      if (profileData.email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
          throw new Error(ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
        }
        userData.email = profileData.email;
      }

      // Handle profile photo upload
      let photoData = null;
      if (file) {
        // Delete old photo if exists
        if (existingUser.profilePhoto) {
          const oldPublicId = existingUser.profilePhoto.split('/').pop();
          await imageService.deleteProfilePhoto(oldPublicId, 'local').catch(() => {});
        }

        // Upload new photo
        photoData = await imageService.uploadProfilePhoto(file, userId);
        userData.profilePhoto = photoData.url;
      }

      // Update user basic info
      if (Object.keys(userData).length > 0) {
        await profileRepository.updateUser(userId, userData, transaction);
      }

      // Prepare profile update data
      const userProfileData = {};
      if (profileData.dob) userProfileData.dob = profileData.dob;
      if (profileData.gender) userProfileData.gender = profileData.gender;
      if (profileData.about) userProfileData.about = profileData.about;
      if (profileData.addressLine1) userProfileData.addressLine1 = profileData.addressLine1;
      if (profileData.addressLine2) userProfileData.addressLine2 = profileData.addressLine2;
      if (profileData.city) userProfileData.city = profileData.city;
      if (profileData.stateId) {
        userProfileData.stateId = parseInt(profileData.stateId);
      }
      if (profileData.pincode) userProfileData.pincode = profileData.pincode;
      if (profileData.latitude) userProfileData.latitude = parseFloat(profileData.latitude);
      if (profileData.longitude) userProfileData.longitude = parseFloat(profileData.longitude);

      // Update or create profile
      if (Object.keys(userProfileData).length > 0) {
        await profileRepository.updateOrCreateProfile(userId, userProfileData, transaction);
      }

      await transaction.commit();

      // Fetch updated profile
      const updatedUser = await profileRepository.getUserWithProfile(userId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        data: {
          ...updatedUser.toJSON(),
          ...(photoData && { photoUpload: photoData })
        }
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete profile photo
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async deleteProfilePhoto(userId) {
    const user = await profileRepository.getUserWithProfile(userId);

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.profilePhoto) {
      throw new Error('No profile photo to delete');
    }

    // Extract publicId from URL
    const publicId = user.profilePhoto.split('/').pop();

    // Delete from storage
    await imageService.deleteProfilePhoto(publicId, 'local');

    // Update database
    await profileRepository.updateUser(userId, { profilePhoto: null });

    return {
      success: true,
      message: 'Profile photo deleted successfully',
      data: null
    };
  }

  /**
   * Get business/KYC info
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async getBusinessInfo(userId) {
    const result = await profileRepository.getBusinessInfo(userId);

    if (!result || !result.user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        kycStatus: result.user.kycStatus,
        nameOnId: result.profile?.nameOnId || null,
        businessName: result.profile?.businessName || null,
        gstin: result.profile?.gstin || null,
        aadharNumber: result.profile?.aadharNumber || null,
        panNumber: result.profile?.panNumber || null
      }
    };
  }

  /**
   * Update business/KYC info
   * @param {number} userId
   * @param {Object} businessData
   * @returns {Promise<Object>}
   */
  async updateBusinessInfo(userId, businessData) {
    const transaction = await sequelize.transaction();

    try {
      // Validate business data
      if (businessData.gstin && businessData.gstin.length !== 15) {
        throw new Error('GSTIN must be 15 characters');
      }

      if (businessData.panNumber && businessData.panNumber.length !== 10) {
        throw new Error('PAN must be 10 characters');
      }

      if (businessData.aadharNumber && businessData.aadharNumber.length !== 12) {
        throw new Error('Aadhar must be 12 digits');
      }

      // Prepare update data
      const updateData = {};
      if (businessData.nameOnId) updateData.nameOnId = businessData.nameOnId;
      if (businessData.businessName) updateData.businessName = businessData.businessName;
      if (businessData.gstin) updateData.gstin = businessData.gstin.toUpperCase();
      if (businessData.aadharNumber) updateData.aadharNumber = businessData.aadharNumber;
      if (businessData.panNumber) updateData.panNumber = businessData.panNumber.toUpperCase();

      // Update profile
      await profileRepository.updateBusinessInfo(userId, updateData, transaction);

      await transaction.commit();

      // Fetch updated info
      const result = await this.getBusinessInfo(userId);

      return {
        success: true,
        message: 'Business information updated successfully',
        data: result.data
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new ProfileService();
