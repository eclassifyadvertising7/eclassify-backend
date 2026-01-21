import profileRepository from '#repositories/profileRepository.js';
import imageService from '#services/imageService.js';
import { uploadFile, deleteFile } from '#config/storageConfig.js';
import { getRelativePath } from '#utils/storageHelper.js';
import { UPLOAD_CONFIG } from '#config/uploadConfig.js';
import { sequelize } from '#models/index.js';
import models from '#models/index.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import sharp from 'sharp';

const { User } = models;
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

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
        if (existingUser.profile?.profilePhoto) {
          await deleteFile(
            existingUser.profile.profilePhoto,
            existingUser.profile.profilePhotoStorageType,
            { resourceType: 'image' }
          ).catch(() => {});
        }

        // Upload new photo
        photoData = await this._uploadProfilePhoto(file, userId);
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
      if (profileData.cityId) {
        userProfileData.cityId = parseInt(profileData.cityId);
      }
      if (profileData.cityName) userProfileData.cityName = profileData.cityName;
      if (profileData.stateId) {
        userProfileData.stateId = parseInt(profileData.stateId);
      }
      if (profileData.stateName) userProfileData.stateName = profileData.stateName;
      if (profileData.pincode) userProfileData.pincode = profileData.pincode;
      if (profileData.latitude) userProfileData.latitude = parseFloat(profileData.latitude);
      if (profileData.longitude) userProfileData.longitude = parseFloat(profileData.longitude);
      
      // Add photo data if uploaded
      if (photoData) {
        userProfileData.profilePhoto = photoData.publicId;
        userProfileData.profilePhotoStorageType = photoData.storageType;
        userProfileData.profilePhotoMimeType = photoData.mimeType;
      }

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
   * Upload profile photo
   * @param {Object} file - Multer file object
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   * @private
   */
  async _uploadProfilePhoto(file, userId) {
    try {
      let photoUrl, publicId, width, height;

      if (STORAGE_TYPE === 'cloudinary') {
        // Optimize image before upload
        const optimizedBuffer = await this._optimizeImage(file, UPLOAD_CONFIG.PROFILE_PHOTO);

        // Upload to Cloudinary
        const folder = `uploads/profiles/user-${userId}`;
        const uploadResult = await uploadFile(
          { ...file, buffer: optimizedBuffer },
          folder,
          { resourceType: 'image' }
        );

        publicId = uploadResult.publicId;
        width = uploadResult.width;
        height = uploadResult.height;
      } else {
        // Local storage
        const relativePath = getRelativePath(file.path);
        await imageService.processImage(file.path, UPLOAD_CONFIG.PROFILE_PHOTO);
        publicId = relativePath;

        // Get dimensions
        const metadata = await sharp(file.path).metadata();
        width = metadata.width;
        height = metadata.height;
      }

      return {
        publicId,
        storageType: STORAGE_TYPE,
        mimeType: file.mimetype,
        width,
        height
      };
    } catch (error) {
      // Clean up uploaded file on error
      if (STORAGE_TYPE === 'local' && file.path) {
        await imageService.deleteImage(getRelativePath(file.path));
      }
      throw error;
    }
  }

  /**
   * Optimize image using Sharp
   * @param {Object} file - Multer file object
   * @param {Object} config - Upload config
   * @returns {Promise<Buffer>}
   * @private
   */
  async _optimizeImage(file, config) {
    try {
      const imageBuffer = file.buffer || (await sharp(file.path).toBuffer());
      
      return await sharp(imageBuffer)
        .resize(config.maxWidth, config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: config.quality })
        .toBuffer();
    } catch (error) {
      console.error('Image optimization error:', error);
      // Return original buffer or read from file path
      return file.buffer || (await sharp(file.path).toBuffer());
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

    if (!user.profile?.profilePhoto) {
      throw new Error('No profile photo to delete');
    }

    // Delete from storage
    await deleteFile(
      user.profile.profilePhoto,
      user.profile.profilePhotoStorageType,
      { resourceType: 'image' }
    );

    // Update database
    await profileRepository.updateOrCreateProfile(userId, {
      profilePhoto: null,
      profilePhotoStorageType: null,
      profilePhotoMimeType: null
    });

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

  async getPreferredLocation(userId) {
    const result = await profileRepository.getPreferredLocation(userId);

    if (!result || !result.user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        preferredStateId: result.profile?.preferredStateId || null,
        preferredStateName: result.profile?.preferredStateName || null,
        preferredCityId: result.profile?.preferredCityId || null,
        preferredCityName: result.profile?.preferredCityName || null,
        preferredLatitude: result.profile?.preferredLatitude || null,
        preferredLongitude: result.profile?.preferredLongitude || null
      }
    };
  }

  async updatePreferredLocation(userId, locationData) {
    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const updateData = {};
      
      if (locationData.preferredStateId !== undefined) {
        updateData.preferredStateId = locationData.preferredStateId ? parseInt(locationData.preferredStateId) : null;
      }
      
      if (locationData.preferredStateName !== undefined) {
        updateData.preferredStateName = locationData.preferredStateName || null;
      }
      
      if (locationData.preferredCityId !== undefined) {
        updateData.preferredCityId = locationData.preferredCityId ? parseInt(locationData.preferredCityId) : null;
      }
      
      if (locationData.preferredCityName !== undefined) {
        updateData.preferredCityName = locationData.preferredCityName || null;
      }
      
      if (locationData.preferredLatitude !== undefined) {
        updateData.preferredLatitude = locationData.preferredLatitude ? parseFloat(locationData.preferredLatitude) : null;
      }
      
      if (locationData.preferredLongitude !== undefined) {
        updateData.preferredLongitude = locationData.preferredLongitude ? parseFloat(locationData.preferredLongitude) : null;
      }

      await profileRepository.updateOrCreateProfile(userId, updateData);

      const result = await this.getPreferredLocation(userId);

      return {
        success: true,
        message: 'Preferred location updated successfully',
        data: result.data
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ProfileService();
