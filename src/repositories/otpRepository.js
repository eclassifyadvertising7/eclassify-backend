import db from '#models/index.js';
import { Op } from 'sequelize';

/**
 * OtpRepository - Database operations for OTP verification
 * Singleton pattern for consistent instance usage
 */
class OtpRepository {
  /**
   * Create OTP record
   * @param {Object} otpData - OTP data
   * @returns {Promise<Object>} Created OTP record
   */
  async create(otpData) {
    return await db.OtpVerification.create(otpData);
  }

  /**
   * Find active OTP by mobile and type
   * @param {string} mobile - Mobile number
   * @param {string} type - OTP type (signup/login/verification)
   * @returns {Promise<Object|null>} OTP record or null
   */
  async findActiveOtp(mobile, type) {
    return await db.OtpVerification.findOne({
      where: {
        mobile,
        type,
        isVerified: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Mark OTP as verified
   * @param {number} otpId - OTP ID
   * @returns {Promise<void>}
   */
  async markAsVerified(otpId) {
    await db.OtpVerification.update(
      {
        isVerified: true,
        verifiedAt: new Date()
      },
      {
        where: { id: otpId }
      }
    );
  }

  /**
   * Increment OTP verification attempts
   * @param {number} otpId - OTP ID
   * @returns {Promise<void>}
   */
  async incrementAttempts(otpId) {
    await db.OtpVerification.increment('attempts', {
      where: { id: otpId }
    });
  }

  /**
   * Invalidate all previous OTPs for mobile and type
   * @param {string} mobile - Mobile number
   * @param {string} type - OTP type
   * @returns {Promise<void>}
   */
  async invalidatePreviousOtps(mobile, type) {
    await db.OtpVerification.update(
      { isVerified: true },
      {
        where: {
          mobile,
          type,
          isVerified: false
        }
      }
    );
  }



  /**
   * Count recent OTPs by mobile number (for rate limiting)
   * @param {string} mobile - Mobile number
   * @param {Date} since - Count OTPs since this time
   * @returns {Promise<number>} Count of OTPs
   */
  async countRecentOtpsByMobile(mobile, since) {
    return await db.OtpVerification.count({
      where: {
        mobile,
        created_at: {
          [Op.gte]: since
        }
      }
    });
  }

  /**
   * Delete expired OTPs (cleanup job)
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteExpiredOtps() {
    const result = await db.OtpVerification.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours old
        }
      }
    });
    return result;
  }
}

// Export singleton instance
export default new OtpRepository();
