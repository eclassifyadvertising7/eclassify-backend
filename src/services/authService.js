import bcrypt from 'bcrypt';
import crypto from 'crypto';
import authRepository from '#repositories/authRepository.js';
import subscriptionRepository from '#repositories/subscriptionRepository.js';
import otpRepository from '#repositories/otpRepository.js';
import userNotificationRepository from '#repositories/userNotificationRepository.js';
import chatRoomRepository from '#repositories/chatRoomRepository.js';
import emailService from '#services/emailService.js';
import { generateTokens, verifyRefreshToken } from '#utils/jwtHelper.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';
import db from '#models/index.js';

class AuthService {
  _generateReferralCode() {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `REF${random.substring(0, 5)}`;
  }

  async _ensureUniqueReferralCode() {
    let code;
    let exists = true;
    
    while (exists) {
      code = this._generateReferralCode();
      const user = await authRepository.findByReferralCode(code);
      exists = !!user;
    }
    
    return code;
  }

  _generateRandomPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async _getUnreadCounts(userId) {
    try {
      const [unreadNotifications, unreadChats] = await Promise.all([
        userNotificationRepository.getUnreadCount(userId),
        chatRoomRepository.getTotalUnreadCount(userId)
      ]);

      return {
        unreadNotifications: unreadNotifications || 0,
        unreadChats: unreadChats || 0
      };
    } catch (error) {
      console.error('Failed to get unread counts:', error.message);
      return {
        unreadNotifications: 0,
        unreadChats: 0
      };
    }
  }

  _assignFreeSubscription(userId) {
    setImmediate(async () => {
      try {
        const freePlan = await subscriptionRepository.findPlanBySlug('free');
        
        if (freePlan) {
          const activatedAt = new Date();
          const endsAt = new Date();
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

  _sendWelcomeNotification(userId, fullName) {
    setImmediate(async () => {
      try {
        const appName = process.env.APP_NAME || 'EClassify';
        
        await userNotificationRepository.create({
          userId,
          notificationType: 'account',
          category: 'account',
          title: `Welcome to ${appName}!`,
          message: `Hi ${fullName}, welcome to ${appName}! We're excited to have you here. Start exploring and posting your listings today.`,
          status: 'unread',
          priority: 'normal',
          isRead: false,
          deliveryMethod: 'in_app'
        });
      } catch (error) {
        console.error('Failed to send welcome notification:', error.message);
      }
    });
  }

  async signup(signupData, deviceInfo = {}) {
    const { fullName, mobile, password, countryCode = '+91', referralCode } = signupData;

    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const existingUser = await authRepository.findByMobile(mobile);
    if (existingUser) {
      throw new Error('Mobile number already registered');
    }

    let referrerId = null;
    if (referralCode) {
      const referrer = await authRepository.findByReferralCode(referralCode);
      if (!referrer) {
        throw new Error('Invalid referral code');
      }
      if (referrer.mobile === mobile) {
        throw new Error('Cannot use your own referral code');
      }
      referrerId = referrer.id;
    }

    const defaultRole = await authRepository.getDefaultRole();
    if (!defaultRole) {
      throw new Error('Default user role not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newReferralCode = await this._ensureUniqueReferralCode();

    const user = await authRepository.create({
      fullName: fullName.trim(),
      mobile,
      countryCode,
      passwordHash,
      roleId: defaultRole.id,
      referralCode: newReferralCode,
      referredBy: referrerId
    });

    if (referrerId) {
      await authRepository.incrementReferralCount(referrerId);
    }

    const userWithRole = await authRepository.findById(user.id);

    this._assignFreeSubscription(userWithRole.id);
    this._sendWelcomeNotification(userWithRole.id, userWithRole.fullName);

    const tokens = generateTokens({
      userId: userWithRole.id,
      roleId: userWithRole.roleId,
      roleSlug: userWithRole.role.slug,
      mobile: userWithRole.mobile,
      email: userWithRole.email
    });

    await authRepository.createSession({
      userId: userWithRole.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    const counts = await this._getUnreadCounts(userWithRole.id);

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
        counts
      },
      timestamp: new Date().toISOString()
    };
  }

  async login(loginData, deviceInfo = {}) {
    const { mobile, password } = loginData;

    if (!mobile || !password) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    const user = await authRepository.findByMobile(mobile);
    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new Error(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    await authRepository.updateLastLogin(user.id);

    const tokens = generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleSlug: user.role.slug,
      mobile: user.mobile,
      email: user.email
    });

    await authRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    const counts = await this._getUnreadCounts(user.id);

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
        tokens,
        counts
      },
      timestamp: new Date().toISOString()
    };
  }

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
        last_login_at: user.lastLoginAt,
        createdAt: user.createdAt
      },
      timestamp: new Date().toISOString()
    };
  }

  async signupWithOtp(signupData, deviceInfo = {}) {
    const { mobile, email, fullName, password, countryCode = '+91', referralCode } = signupData;

    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Valid email address is required');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const mobileVerified = await otpRepository.findVerifiedOtp(mobile, 'signup');
    const emailVerified = await otpRepository.findVerifiedOtp(email, 'signup');

    if (!mobileVerified && !emailVerified) {
      throw new Error('Either mobile number or email must be verified via OTP before signup');
    }

    const existingUser = await authRepository.findByMobile(mobile);
    if (existingUser) {
      throw new Error('Mobile number already registered');
    }

    const existingEmailUser = await authRepository.findByEmail(email);
    if (existingEmailUser) {
      throw new Error('Email address already registered');
    }

    let referrerId = null;
    if (referralCode) {
      const referrer = await authRepository.findByReferralCode(referralCode);
      if (!referrer) {
        throw new Error('Invalid referral code');
      }
      if (referrer.mobile === mobile) {
        throw new Error('Cannot use your own referral code');
      }
      referrerId = referrer.id;
    }

    const defaultRole = await authRepository.getDefaultRole();
    if (!defaultRole) {
      throw new Error('Default user role not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newReferralCode = await this._ensureUniqueReferralCode();

    const user = await authRepository.create({
      fullName: fullName.trim(),
      mobile,
      email,
      countryCode,
      passwordHash,
      roleId: defaultRole.id,
      referralCode: newReferralCode,
      referredBy: referrerId,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    });

    if (referrerId) {
      await authRepository.incrementReferralCount(referrerId);
    }

    const userWithRole = await authRepository.findById(user.id);

    this._assignFreeSubscription(userWithRole.id);
    this._sendWelcomeNotification(userWithRole.id, userWithRole.fullName);

    // Password email sending commented out - frontend handles password
    // if (email) {
    //   setImmediate(async () => {
    //     try {
    //       await emailService.sendPasswordEmail(email, fullName, autoPassword);
    //       console.log(`Password email sent to ${email}`);
    //     } catch (error) {
    //       console.error('Failed to send password email:', error.message);
    //     }
    //   });
    // }

    const tokens = generateTokens({
      userId: userWithRole.id,
      roleId: userWithRole.roleId,
      roleSlug: userWithRole.role.slug,
      mobile: userWithRole.mobile,
      email: userWithRole.email
    });

    await authRepository.createSession({
      userId: userWithRole.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    const counts = await this._getUnreadCounts(userWithRole.id);

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
        counts,
        authMethod: 'otp'
      },
      timestamp: new Date().toISOString()
    };
  }

  async loginWithOtp(loginData, deviceInfo = {}) {
    const { mobile, email } = loginData;

    if (!mobile && !email) {
      throw new Error('Either mobile number or email address is required');
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE_FORMAT);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Valid email address is required');
    }

    const identifier = mobile || email;
    const verifiedOtp = await otpRepository.findVerifiedOtp(identifier, 'login');

    if (!verifiedOtp) {
      const contactType = mobile ? 'Mobile number' : 'Email address';
      throw new Error(`${contactType} must be verified via OTP before login`);
    }

    const user = await authRepository.findByMobile(mobile);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new Error(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

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
      Object.assign(user, updateData);
    }

    await authRepository.updateLastLogin(user.id);

    const tokens = generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleSlug: user.role.slug,
      mobile: user.mobile,
      email: user.email
    });

    await authRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      deviceName: deviceInfo.deviceName || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddressV4: deviceInfo.ipAddressV4 || null,
      isActive: true
    });

    const counts = await this._getUnreadCounts(user.id);

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
        counts,
        authMethod: 'otp'
      },
      timestamp: new Date().toISOString()
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error(error.message);
    }

    const session = await authRepository.findSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new Error('Invalid refresh token');
    }

    const user = await authRepository.findById(decoded.userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.status === 'blocked' || user.status === 'suspended' || !user.isActive) {
      throw new Error(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
    }

    await authRepository.invalidateSession(refreshToken);

    const tokens = generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleSlug: user.role.slug,
      mobile: user.mobile,
      email: user.email
    });

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

  async logout(refreshToken) {
    if (!refreshToken) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    await authRepository.invalidateSession(refreshToken);

    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async findByMobile(mobile) {
    return await authRepository.findByMobile(mobile);
  }

  async createSession(sessionData) {
    return await authRepository.createSession(sessionData);
  }

  async updateLastLogin(userId) {
    return await authRepository.updateLastLogin(userId);
  }

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

export default new AuthService();
