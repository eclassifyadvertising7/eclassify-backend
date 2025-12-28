import { successResponse, errorResponse, paginatedResponse } from '#utils/responseFormatter.js';
import authRepository from '#repositories/authRepository.js';
import db from '#models/index.js';

class ReferralController {
  static async getMyReferralCode(req, res) {
    try {
      const user = await authRepository.findById(req.user.userId);
      
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      return successResponse(res, {
        referralCode: user.referralCode,
        referralCount: user.referralCount || 0,
        shareUrl: `${frontendUrl}/signup?ref=${user.referralCode}`,
        shareMessage: `Join me on ${process.env.APP_NAME || 'EClassify'} using my referral code: ${user.referralCode}`
      }, 'Referral code retrieved successfully');
    } catch (error) {
      console.error('Get referral code error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getMyReferrals(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await db.User.findAndCountAll({
        where: { referredBy: req.user.userId },
        attributes: ['id', 'fullName', 'mobile', ['created_at', 'createdAt']],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      return paginatedResponse(res, rows, {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }, 'Referrals retrieved successfully');
    } catch (error) {
      console.error('Get referrals error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async validateReferralCode(req, res) {
    try {
      const { code } = req.params;
      
      if (!code) {
        return errorResponse(res, 'Referral code is required', 400);
      }

      const referrer = await authRepository.findByReferralCode(code);
      
      if (!referrer) {
        return errorResponse(res, 'Invalid referral code', 404);
      }

      return successResponse(res, {
        valid: true,
        referrerName: referrer.fullName
      }, 'Valid referral code');
    } catch (error) {
      console.error('Validate referral code error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

export default ReferralController;
