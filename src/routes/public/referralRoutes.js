import express from 'express';
import ReferralController from '#controllers/end-user/referralController.js';

const router = express.Router();

router.get('/validate/:code', ReferralController.validateReferralCode);

export default router;
