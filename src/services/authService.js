import bcrypt from 'bcrypt';
import authRepository from '#repositories/authRepository.js';
import { generateTokens, verifyRefreshToken } from '#utils/jwtHelper.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

/**
 * AuthService - Business logic for authentication
 * Singleton pattern for consistent instance usage
 */
class AuthService {
  /**
   * Register new user
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
          isEmailVerified: userWithRole.isEmailVerified
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
        subscriptionType: user.subscriptionType,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        last_login_at: user.lastLoginAt,
        createdAt: user.createdAt
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
}

// Export singleton instance
export default new AuthService();
