import express from 'express';
import UserManagementController from '#controllers/panel/userManagementController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User statistics
router.get('/statistics', UserManagementController.getUserStatistics);

// List users
router.get('/list/external', UserManagementController.listExternalUsers);
router.get('/list/internal', UserManagementController.listInternalUsers);

// Create user
router.post('/create', UserManagementController.createUser);

// User details
router.get('/view/:userId', UserManagementController.getUserDetails);

// Toggle user status (explicit payload: { isActive: true/false })
router.patch('/status/:userId', UserManagementController.toggleUserStatus);

// Delete user
router.delete('/delete/:userId', UserManagementController.deleteUser);

// KYC management (explicit payload: { kycStatus: 'pending'/'approved'/'rejected' })
router.patch('/kyc-status/:userId', UserManagementController.updateKycStatus);

// Verify user
router.patch('/verify/:userId', UserManagementController.makeUserVerified);

// Auto-approve toggle (explicit payload: { isEnabled: true/false })
router.patch('/auto-approve/:userId', UserManagementController.toggleAutoApprove);

export default router;
