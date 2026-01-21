import express from 'express';
import ReportController from '#controllers/end-user/reportController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Report listing (action before ID to avoid conflicts)
router.post('/listing/:listingId', ReportController.reportListing);

// Report user (action before ID to avoid conflicts)
router.post('/user/:userId', ReportController.reportUser);

export default router;
