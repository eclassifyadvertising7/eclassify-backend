import express from 'express';
import UserActivityController from '#controllers/end-user/userActivityController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/recently-viewed',
  authenticate,
  UserActivityController.getRecentlyViewedListings
);

export default router;
