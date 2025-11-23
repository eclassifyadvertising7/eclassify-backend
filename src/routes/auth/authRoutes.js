import express from 'express';
import AuthController from '#controllers/auth/authController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register new user
 * @access Public
 */
router.post('/signup', AuthController.signup);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route GET /api/auth/profile
 * @desc Get authenticated user profile
 * @access Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate refresh token
 * @access Public
 */
router.post('/logout', AuthController.logout);

export default router;
