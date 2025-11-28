import express from 'express';
import DataRequestController from '#controllers/end-user/dataRequestController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new data request (car or location)
router.post('/', DataRequestController.createRequest);

// Get user's own requests
router.get('/', DataRequestController.getMyRequests);

// Get specific request by ID
router.get('/:id', DataRequestController.getRequestById);

export default router;
