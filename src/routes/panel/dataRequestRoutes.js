import express from 'express';
import DataRequestController from '#controllers/panel/dataRequestController.js';
import { authenticate, authorize } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and super_admin role
router.use(authenticate);
// router.use(authorize(['super_admin']));

// Get statistics
router.get('/statistics', DataRequestController.getStatistics);

// Get all requests with filters
router.get('/', DataRequestController.getAllRequests);

// Get specific request by ID
router.get('/:id', DataRequestController.getRequestById);

// Update request (edit request details before approval/rejection)
router.put('/:id', DataRequestController.updateRequest);

// Approve request (explicit payload)
router.patch('/approve/:id', DataRequestController.approveRequest);

// Reject request (explicit payload)
router.patch('/reject/:id', DataRequestController.rejectRequest);

export default router;
