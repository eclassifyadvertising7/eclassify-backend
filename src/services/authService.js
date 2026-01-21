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
import config from '#config/env.js';

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
        const freePlans = await subscriptionRepository.getAllFreePlans();
        
        if (!freePlans || freePlans.length === 0) {
          console.error('No free plans found');
          return;
        }

        const subscriptionPromises = freePlans.map(freePlan => {
          const activatedAt = new Date();
          const endsAt = new Date();
          const durationDays = freePlan.durationDays || 30;
          endsAt.setDate(endsAt.getDate() + durationDays);

          return subscriptionRepository.createSubscription({
            userId,
            planId: freePlan.id,
            planName: freePlan.name,
            planCode: freePlan.planCode,
            planVersion: freePlan.version,
            isFreePlan: freePlan.isFreePlan,
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
        });

        await Promise.all(subscriptionPromises);
        console.log(`Assigned ${freePlans.length} free plans to user ${userId}`);
      } catch (error) {
        console.error('Failed to assign free plans:', error.message);
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
    const { username, password } = loginData;

    if (!username || !password) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    const isMobile = /^\d{10}$/.test(username);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

    if (!isMobile && !isEmail) {
      throw new Error('Invalid email or mobile number format');
    }

    const user = isMobile 
      ? await authRepository.findByMobile(username)
      : await authRepository.findByEmail(username);

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
    const { username } = loginData;

    if (!username) {
      throw new Error('Email or mobile number is required');
    }

    const isMobile = /^\d{10}$/.test(username);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

    if (!isMobile && !isEmail) {
      throw new Error('Invalid email or mobile number format');
    }

    const verifiedOtp = await otpRepository.findVerifiedOtp(username, 'login');

    if (!verifiedOtp) {
      const contactType = isMobile ? 'Mobile number' : 'Email address';
      throw new Error(`${contactType} must be verified via OTP before login`);
    }

    const user = isMobile 
      ? await authRepository.findByMobile(username)
      : await authRepository.findByEmail(username);

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
    if (isMobile && !user.isPhoneVerified) {
      updateData.isPhoneVerified = true;
      updateData.phoneVerifiedAt = new Date();
    }
    if (isEmail && !user.isEmailVerified) {
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

  async forgotPassword(username) {
    if (!username) {
      throw new Error('Email or mobile number is required');
    }

    const isMobile = /^\d{10}$/.test(username);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

    if (!isMobile && !isEmail) {
      throw new Error('Invalid email or mobile number format');
    }

    const user = isMobile 
      ? await authRepository.findByMobile(username)
      : await authRepository.findByEmail(username);

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new Error(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const hasEmail = user.email && user.email.trim() !== '';
    const channel = hasEmail ? 'email' : 'sms';
    const otpTarget = hasEmail ? user.email : user.mobile;

    await otpRepository.invalidatePreviousOtps(username, 'password_reset');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await otpRepository.create({
      mobile: isMobile ? username : (hasEmail ? null : user.mobile),
      email: isEmail ? username : (hasEmail ? user.email : null),
      countryCode: user.countryCode,
      otp,
      type: 'password_reset',
      channel,
      expiresAt
    });

    if (channel === 'email') {
      setImmediate(async () => {
        try {
          await emailService.sendOtp(otpTarget, otp, 'password-reset', user.fullName);
          console.log(`Password reset OTP sent to ${otpTarget}`);
        } catch (error) {
          console.error('Failed to send password reset OTP:', error.message);
        }
      });
    }

    return {
      success: true,
      message: channel === 'email'
        ? 'Password reset OTP has been sent to your email'
        : 'Password reset OTP has been sent to your mobile',
      data: {
        email: user.email,
        channel,
        expiresAt
      },
      timestamp: new Date().toISOString()
    };
  }

  async resetPassword(username, otp, newPassword) {
    if (!username || !otp || !newPassword) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const isMobile = /^\d{10}$/.test(username);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

    if (!isMobile && !isEmail) {
      throw new Error('Invalid email or mobile number format');
    }

    const otpRecord = await otpRepository.findActiveOtp(username, 'password_reset');

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    if (otpRecord.otp !== otp) {
      await otpRepository.incrementAttempts(otpRecord.id);
      throw new Error('Invalid OTP');
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      throw new Error('OTP has expired');
    }

    const user = isMobile 
      ? await authRepository.findByMobile(username)
      : await authRepository.findByEmail(username);

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(user.id, passwordHash);
    await otpRepository.markAsVerified(otpRecord.id);
    await authRepository.invalidateAllUserSessions(user.id);

    return {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      data: null,
      timestamp: new Date().toISOString()
    };
  }
}

export default new AuthService();
