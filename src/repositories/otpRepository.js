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
   * Find active OTP by identifier (mobile or email) and type
   * @param {string} identifier - Mobile number or email address
   * @param {string} type - OTP type (signup/login/verification)
   * @returns {Promise<Object|null>} OTP record or null
   */
  async findActiveOtp(identifier, type) {
    // Determine if identifier is email or mobile
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    const whereClause = {
      type,
      isVerified: false,
      expiresAt: {
        [Op.gt]: new Date()
      }
    };

    if (isEmail) {
      whereClause.email = identifier;
    } else {
      whereClause.mobile = identifier;
    }

    return await db.OtpVerification.findOne({
      where: whereClause,
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
   * Invalidate all previous OTPs for identifier (mobile or email) and type
   * @param {string} identifier - Mobile number or email address
   * @param {string} type - OTP type
   * @returns {Promise<void>}
   */
  async invalidatePreviousOtps(identifier, type) {
    // Determine if identifier is email or mobile
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    const whereClause = {
      type,
      isVerified: false
    };

    if (isEmail) {
      whereClause.email = identifier;
    } else {
      whereClause.mobile = identifier;
    }

    await db.OtpVerification.update(
      { isVerified: true },
      { where: whereClause }
    );
  }



  /**
   * Count recent OTPs by identifier (mobile or email) for rate limiting
   * @param {string} identifier - Mobile number or email address
   * @param {Date} since - Count OTPs since this time
   * @returns {Promise<number>} Count of OTPs
   */
  async countRecentOtpsByIdentifier(identifier, since) {
    // Determine if identifier is email or mobile
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    const whereClause = {
      created_at: {
        [Op.gte]: since
      }
    };

    if (isEmail) {
      whereClause.email = identifier;
    } else {
      whereClause.mobile = identifier;
    }

    return await db.OtpVerification.count({
      where: whereClause
    });
  }

  /**
   * Check if identifier (mobile or email) has been verified for specific type
   * @param {string} identifier - Mobile number or email address
   * @param {string} type - OTP type (signup/login/verification)
   * @returns {Promise<Object|null>} Verified OTP record or null
   */
  async findVerifiedOtp(identifier, type) {
    // Determine if identifier is email or mobile
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    const whereClause = {
      type,
      isVerified: true,
      verifiedAt: {
        [Op.ne]: null
      }
    };

    if (isEmail) {
      whereClause.email = identifier;
    } else {
      whereClause.mobile = identifier;
    }

    return await db.OtpVerification.findOne({
      where: whereClause,
      order: [['verified_at', 'DESC']]
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
