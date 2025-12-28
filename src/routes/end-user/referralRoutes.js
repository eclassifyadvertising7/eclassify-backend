import express from 'express';
import ReferralController from '#controllers/end-user/referralController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-code', authenticate, ReferralController.getMyReferralCode);
router.get('/my-referrals', authenticate, ReferralController.getMyReferrals);

export default router;
