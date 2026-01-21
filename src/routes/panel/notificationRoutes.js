import express from 'express';
import NotificationManagementController from '#controllers/panel/notificationManagementController.js';
import authMiddleware from '#middleware/authMiddleware.js';
import roleMiddleware from '#middleware/roleMiddleware.js';

const router = express.Router();

router.post(
  '/send',
  authMiddleware,
  roleMiddleware(['super_admin']),
  NotificationManagementController.sendNotification
);

router.post(
  '/send-bulk',
  authMiddleware,
  roleMiddleware(['super_admin']),
  NotificationManagementController.sendBulkNotifications
);

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware(['super_admin', 'admin']),
  NotificationManagementController.getNotificationStats
);

router.get(
  '/delivery-report',
  authMiddleware,
  roleMiddleware(['super_admin', 'admin']),
  NotificationManagementController.getDeliveryReport
);

export default router;
