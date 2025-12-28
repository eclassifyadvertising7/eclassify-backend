import express from 'express';
import ReportManagementController from '#controllers/panel/reportManagementController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(allowRoles(['super_admin', 'admin']));

// Listing Reports
router.get('/listings', ReportManagementController.getListingReports);
router.get('/listings/stats', ReportManagementController.getListingReportStatistics);
router.get('/listings/:reportId', ReportManagementController.getListingReportById);
router.patch('/listings/status/:reportId', ReportManagementController.updateListingReportStatus);
router.get('/listings/by-listing/:listingId', ReportManagementController.getReportsByListing);

// User Reports
router.get('/users', ReportManagementController.getUserReports);
router.get('/users/stats', ReportManagementController.getUserReportStatistics);
router.get('/users/:reportId', ReportManagementController.getUserReportById);
router.patch('/users/status/:reportId', ReportManagementController.updateUserReportStatus);
router.get('/users/by-user/:userId', ReportManagementController.getReportsByUser);

export default router;
