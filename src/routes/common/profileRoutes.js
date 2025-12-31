import express from 'express';
import ProfileController from '#controllers/common/profileController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';
import { uploadProfilePhoto } from '#middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/profile/me
 * @desc Get current user's profile
 * @access Private (All authenticated users)
 */
router.get('/me', authenticate, ProfileController.getProfile);

/**
 * @route PUT /api/profile/me
 * @desc Update current user's profile
 * @access Private (All authenticated users)
 */
router.put(
  '/me',
  authenticate,
  uploadProfilePhoto,
  ProfileController.updateProfile
);

/**
 * @route DELETE /api/profile/me/photo
 * @desc Delete current user's profile photo
 * @access Private (All authenticated users)
 */
router.delete('/me/photo', authenticate, ProfileController.deleteProfilePhoto);

/**
 * @route GET /api/profile/me/business
 * @desc Get current user's business/KYC info
 * @access Private (All authenticated users)
 */
router.get('/me/business', authenticate, ProfileController.getBusinessInfo);

/**
 * @route PUT /api/profile/me/business
 * @desc Update current user's business/KYC info
 * @access Private (All authenticated users)
 */
router.put('/me/business', authenticate, ProfileController.updateBusinessInfo);

/**
 * @route GET /api/profile/me/preferred-location
 * @desc Get current user's preferred location
 * @access Private (All authenticated users)
 */
router.get('/me/preferred-location', authenticate, ProfileController.getPreferredLocation);

/**
 * @route PUT /api/profile/me/preferred-location
 * @desc Update current user's preferred location
 * @access Private (All authenticated users)
 */
router.put('/me/preferred-location', authenticate, ProfileController.updatePreferredLocation);

/**
 * @route GET /api/profile/:userId
 * @desc Get any user's profile by ID (Admin only)
 * @access Private (Admin/Super Admin)
 */
router.get(
  '/:userId',
  authenticate,
  allowRoles(['super_admin', 'admin']),
  ProfileController.getProfileById
);

/**
 * @route PUT /api/profile/:userId
 * @desc Update any user's profile by ID (Admin only)
 * @access Private (Admin/Super Admin)
 */
router.put(
  '/:userId',
  authenticate,
  allowRoles(['super_admin', 'admin']),
  uploadProfilePhoto,
  ProfileController.updateProfileById
);

export default router;
