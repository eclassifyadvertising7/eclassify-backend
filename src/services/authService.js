import crypto from 'crypto';
import bcrypt from 'bcrypt';
import authRepository from '#repositories/authRepository.js';
import subscriptionRepository from '#repositories/subscriptionRepository.js';
import otpRepository from '#repositories/otpRepository.js';
import emailService from '#services/emailService.js';
import { generateTokens, verifyRefreshToken } from '#utils/jwtHelper.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import db from '#models/index.js';

/**
 * AuthService - Business logic for authentication
 * Singleton pattern for consistent instance usage
 */
class AuthService {
  /**
   * Generate random 8-digit alphanumeric password
   * @private
   * @returns {string} Random password
   */
  _generateRandomPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Assign free subscription to user (async, non-blocking)
   * @private
   * @param {number} userId - User ID
   */
  _assignFreeSubscription(userId) {
    setImmediate(async () => {
      try {
        const freePlan = await subscriptionRepository.findPlanBySlug('free');
        
        if (freePlan) {
          const activatedAt = new Date();
          const endsAt = new Date();
          // Use plan's duration days from database
          const durationDays = freePlan.durationDays || 30;
          endsAt.setDate(endsAt.getDate() + durationDays);

          await subscriptionRepository.createSubscription({
            userId,
            planId: freePlan.id,
            planName: freePlan.name,
            planCode: freePlan.planCode,
            planVersion: freePlan.version,
            status: 'active',
            activatedAt,
            endsAt,
            basePrice: 0,
            finalPrice: 0,
            durationDays,
            // Copy all quota and feature fields from plan
            maxTotalListings: freePlan.maxTotalListings || 0,
            maxActiveListings: freePlan.maxActiveListings || 0,
            listingQuotaLimit: freePlan.listingQuotaLimit,
            listingQuotaRollingDays: freePlan.listingQuotaRollingDays,
            maxFeaturedListings: freePlan.maxFeaturedListings || 0,
            maxBoostedListings: freePlan.maxBoostedListings || 0,
            maxSpotlightListings: freePlan.maxSpotlightListings || 0,
            maxHomepageListings: freePlan.maxHomepageListings || 0,
            featuredDays: freePlan.featuredDays || 0,
            boostedDays: freePlan.boostedDays || 0,
            spotlightDays: freePlan.spotlightDays || 0,
            priorityScore: freePlan.priorityScore || 0,
            searchBoostMultiplier: freePlan.searchBoostMultiplier || 1.0,
            recommendationBoostMultiplier: freePlan.recommendationBoostMultiplier || 1.0,
            crossCityVisibility: freePlan.crossCityVisibility || false,
            nationalVisibility: freePlan.nationalVisibility || false,
            autoRenewalEnabled: freePlan.autoRenewal || false,
            maxRenewals: freePlan.maxRenewals || 0,
            listingDurationDays: freePlan.listingDurationDays || 30,
            autoRefreshEnabled: freePlan.autoRefreshEnabled || false,
            refreshFrequencyDays: freePlan.refreshFrequencyDays,
            manualRefreshPerCycle: freePlan.manualRefreshPerCycle || 0,
            isAutoApproveEnabled: freePlan.isAutoApproveEnabled || false,
            supportLevel: freePlan.supportLevel || 'standard',
            features: freePlan.features || {},
            autoRenew: false,
            paymentMethod: 'free'
          }, userId);
        }
      } catch (error) {
        console.error('Failed to assign free plan:', error.message);
      }
    });
  }

  /**
   * Register new user (password-based)
   * @param {Object} signupData - User signup data
   * @param {string} signupData.fullName - User's full name
   * @param {string} signupData.mobile - Mobile number
   * @param {string} signupData.password - Password
   * @param {string} signupData.countryCode - Country code (optional, defaults to +91)
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Service response with user data and token
   */
  async signup(signupData, deviceInfo = {}) {
    const { fullName, mobile, password, countryCode = '+91' } = signupData;

    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if mobile already exists
    const existingUser = await authRepository.findByMobile(mobile);
    if (existingUser) {
      throw new Error('Mobile number already registered');
    }

    // Get default role
    const defaultRole = await authRepository.getDefaultRole();
    if (!defaultRole) {
      throw new Error('Default user role not found');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await authRepository.create({
      fullName: fullName.trim(),
      mobile,
      countryCode,
      passwordHash,
      roleId: defaultRole.id
    });

    // Fetch user with role
    const userWithRole = await authRepository.findById(user.id);

    // Assign free subscription asynchronously
    this._assignFreeSubscription(userWithRole.id);

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: userWithRole.id,
      roleId: userWithRole.roleId,
      roleSlug: userWithRole.role.slug,
      mobile: userWithRole.mobile,
      email: userWithRole.email
    });

    // Create session record
    await authRepository.createSession({
      userId: userWithRole.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      data: {
        user: {
          id: userWithRole.id,
          fullName: userWithRole.fullName,
          mobile: userWithRole.mobile,
          countryCode: userWithRole.countryCode,
          email: userWithRole.email,
          role: userWithRole.role.slug,
          profile_image: userWithRole.profilePhoto,
          last_login_at: null,
          isPhoneVerified: userWithRole.isPhoneVerified,
          isEmailVerified: userWithRole.isEmailVerified,
          is_password_reset: userWithRole.isPasswordReset
        },
        tokens
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Login user
   * @param {Object} loginData - Login credentials
   * @param {string} loginData.mobile - Mobile number
   * @param {string} loginData.password - Password
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Service response with user data and token
   */
  async login(loginData, deviceInfo = {}) {
    const { mobile, password } = loginData;

    // Validate required fields
    if (!mobile || !password) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    // Find user by mobile
    const user = await authRepository.findByMobile(mobile);
    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check account status
    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new Error(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleSlug: user.role.slug,
      mobile: user.mobile,
      email: user.email
    });

    // Create session record
    await authRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    const lastLoginAt = new Date().toISOString();

    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          mobile: user.mobile,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role.slug,
          profile_image: user.profilePhoto,
          last_login_at: lastLoginAt,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Service response with user data
   */
  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
      data: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        countryCode: user.countryCode,
        email: user.email,
        role: user.role.slug,
        profile_image: user.profilePhoto,
        status: user.status,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        is_password_reset: user.isPasswordReset,
        subscriptionType: user.subscriptionType,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        last_login_at: user.lastLoginAt,
        createdAt: user.createdAt
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Register new user (OTP-based)
   * @param {Object} signupData - User signup data
   * @param {string} signupData.mobile - Mobile number
   * @param {string} signupData.fullName - User's full name
   * @param {string} signupData.countryCode - Country code (optional, defaults to +91)
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Service response with user data and tokens
   */
  async signupWithOtp(signupData, deviceInfo = {}) {
    const { mobile, email, fullName, countryCode = '+91' } = signupData;

    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Valid email address is required');
    }

    // Check OTP verification status - either mobile OR email must be verified
    const mobileVerified = await otpRepository.findVerifiedOtp(mobile, 'signup');
    const emailVerified = await otpRepository.findVerifiedOtp(email, 'signup');

    if (!mobileVerified && !emailVerified) {
      throw new Error('Either mobile number or email must be verified via OTP before signup');
    }

    // Check if mobile already exists
    const existingUser = await authRepository.findByMobile(mobile);
    if (existingUser) {
      throw new Error('Mobile number already registered');
    }

    // Check if email already exists
    const existingEmailUser = await authRepository.findByEmail(email);
    if (existingEmailUser) {
      throw new Error('Email address already registered');
    }

    // Get default role
    const defaultRole = await authRepository.getDefaultRole();
    if (!defaultRole) {
      throw new Error('Default user role not found');
    }

    // Generate random password
    const autoPassword = this._generateRandomPassword();
    const passwordHash = await bcrypt.hash(autoPassword, 10);

    // Create user
    const user = await authRepository.create({
      fullName: fullName.trim(),
      mobile,
      email,
      countryCode,
      passwordHash,
      roleId: defaultRole.id,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    });

    // Fetch user with role
    const userWithRole = await authRepository.findById(user.id);

    // Assign free subscription asynchronously
    this._assignFreeSubscription(userWithRole.id);

    // Send password email asynchronously (if email is available)
    if (email) {
      setImmediate(async () => {
        try {
          await emailService.sendPasswordEmail(email, fullName, autoPassword);
          console.log(`Password email sent to ${email}`);
        } catch (error) {
          console.error('Failed to send password email:', error.message);
        }
      });
    }

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: userWithRole.id,
      roleId: userWithRole.roleId,
      roleSlug: userWithRole.role.slug,
      mobile: userWithRole.mobile,
      email: userWithRole.email
    });

    // Create session record
    await authRepository.createSession({
      userId: userWithRole.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      data: {
        user: {
          id: userWithRole.id,
          fullName: userWithRole.fullName,
          mobile: userWithRole.mobile,
          countryCode: userWithRole.countryCode,
          email: userWithRole.email,
          role: userWithRole.role.slug,
          profile_image: userWithRole.profilePhoto,
          last_login_at: null,
          isPhoneVerified: userWithRole.isPhoneVerified,
          isEmailVerified: userWithRole.isEmailVerified,
          is_password_reset: userWithRole.isPasswordReset
        },
        tokens,
        authMethod: 'otp'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Login user (OTP-based)
   * @param {Object} loginData - Login data
   * @param {string} loginData.mobile - Mobile number
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Service response with user data and tokens
   */
  async loginWithOtp(loginData, deviceInfo = {}) {
    const { mobile, email } = loginData;

    // Validate required fields - at least one identifier is required
    if (!mobile && !email) {
      throw new Error('Either mobile number or email address is required');
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Valid email address is required');
    }

    // Check OTP verification status - either mobile OR email must be verified
    const identifier = mobile || email;
    const verifiedOtp = await otpRepository.findVerifiedOtp(identifier, 'login');

    if (!verifiedOtp) {
      const contactType = mobile ? 'Mobile number' : 'Email address';
      throw new Error(`${contactType} must be verified via OTP before login`);
    }

    // Find user by mobile
    const user = await authRepository.findByMobile(mobile);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Check account status
    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new Error(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Update verification status based on OTP channel
    const updateData = {};
    if (!user.isPhoneVerified) {
      updateData.isPhoneVerified = true;
      updateData.phoneVerifiedAt = new Date();
    }
    if (!user.isEmailVerified) {
      updateData.isEmailVerified = true;
      updateData.emailVerifiedAt = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      await db.User.update(updateData, { where: { id: user.id } });
      // Update local user object
      Object.assign(user, updateData);
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleSlug: user.role.slug,
      mobile: user.mobile,
      email: user.email
    });

    // Create session record
    await authRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          mobile: user.mobile,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role.slug,
          profile_image: user.profilePhoto,
          last_login_at: new Date().toISOString(),
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          is_password_reset: user.isPasswordReset
        },
        tokens,
        authMethod: 'otp'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Service response with new tokens
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error(error.message);
    }

    // Check if session exists and is active
    const session = await authRepository.findSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new Error('Invalid refresh token');
    }

    // Get user data
    const user = await authRepository.findById(decoded.userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Check account status
    if (user.status === 'blocked' || user.status === 'suspended' || !user.isActive) {
      throw new Error(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
    }

    // Invalidate old session
    await authRepository.invalidateSession(refreshToken);

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleSlug: user.role.slug,
      mobile: user.mobile,
      email: user.email
    });

    // Create new session (refresh token doesn't have device info)
    await authRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      deviceName: null,
      userAgent: null,
      ipAddressV4: null,
      isActive: true
    });

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Logout user by invalidating refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Service response
   */
  async logout(refreshToken) {
    if (!refreshToken) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    // Invalidate session
    await authRepository.invalidateSession(refreshToken);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Find user by mobile number
   * @param {string} mobile - Mobile number
   * @returns {Promise<Object|null>} User object or null
   */
  async findByMobile(mobile) {
    return await authRepository.findByMobile(mobile);
  }

  /**
   * Create session record
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    return await authRepository.createSession(sessionData);
  }

  /**
   * Update user's last login timestamp
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async updateLastLogin(userId) {
    return await authRepository.updateLastLogin(userId);
  }

  /**
   * Update user mobile number
   * @param {number} userId - User ID
   * @param {string} mobile - Mobile number
   * @param {string} countryCode - Country code
   * @returns {Promise<void>}
   */
  async updateUserMobile(userId, mobile, countryCode = '+91') {
    await db.User.update(
      { 
        mobile, 
        countryCode,
        isPhoneVerified: false,
        phoneVerifiedAt: null
      },
      { where: { id: userId } }
    );
  }
}

// Export singleton instance
export default new AuthService();
