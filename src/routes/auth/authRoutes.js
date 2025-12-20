import express from 'express';
import AuthController from '#controllers/auth/authController.js';
import OtpController from '#controllers/auth/otpController.js';
import GoogleAuthController from '#controllers/auth/googleAuthController.js';
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
 * @desc Verify OTP only (no user creation)
 * @access Public
 */
router.post('/otp/verify', OtpController.verifyOtp);

/**
 * @route POST /api/auth/otp/signup
 * @desc Complete signup after OTP verification
 * @access Public
 */
router.post('/otp/signup', OtpController.completeSignup);

/**
 * @route POST /api/auth/otp/login
 * @desc Complete login after OTP verification
 * @access Public
 */
router.post('/otp/login', OtpController.completeLogin);

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

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth login
 * @access Public
 */
router.get('/google', GoogleAuthController.googleAuth);

/**
 * @route GET /api/auth/google/callback
 * @desc Handle Google OAuth callback
 * @access Public
 */
router.get('/google/callback', GoogleAuthController.googleCallback);

/**
 * @route POST /api/auth/google/complete-profile
 * @desc Complete profile for Google users (add mobile number)
 * @access Private
 */
router.post('/google/complete-profile', authenticate, GoogleAuthController.completeProfile);

export default router;
