import express from 'express';
import AuthController from '#controllers/auth/authController.js';
import OtpController from '#controllers/auth/otpController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register new user (password-based)
 * @access Public
 */
router.post('/signup', AuthController.signup);

/**
 * @route POST /api/auth/login
 * @desc Login user (password-based)
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/otp/send
 * @desc Send OTP to mobile number
 * @access Public
 */
router.post('/otp/send', OtpController.sendOtp);

/**
 * @route POST /api/auth/otp/verify
 * @desc Verify OTP and complete signup/login
 * @access Public
 */
router.post('/otp/verify', OtpController.verifyOtp);

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
