import express from 'express';
import DashboardController from '#controllers/panel/dashboardController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

router.get(
  '/overview',
  authenticate,
  allowRoles(['super_admin', 'admin']),
  DashboardController.getOverviewStats
);

router.get(
  '/detailed',
  authenticate,
  allowRoles(['super_admin', 'admin']),
  DashboardController.getDetailedStats
);

export default router;
