import passport from '#config/passport.js';
import authService from '#services/authService.js';
import subscriptionRepository from '#repositories/subscriptionRepository.js';
import { generateTokens } from '#utils/jwtHelper.js';
import { SUCCESS_MESSAGES } from '#utils/constants/messages.js';

/**
 * GoogleAuthController - Handle Google OAuth authentication
 */
class GoogleAuthController {
  /**
   * Initiate Google OAuth login
   * @route GET /api/auth/google
   */
  static googleAuth(req, res, next) {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || 
        !process.env.GOOGLE_CLIENT_SECRET || 
        process.env.GOOGLE_CLIENT_ID === 'your-google-client-id' ||
        process.env.GOOGLE_CLIENT_SECRET === 'your-google-client-secret') {
      return res.status(503).json({
        success: false,
        message: 'Google OAuth is not configured on this server',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // Store device info in session for later use
    req.session = req.session || {};
    req.session.deviceInfo = {
      deviceName: req.query.device_name || null,
      userAgent: req.headers['user-agent'] || null,
      ipAddressV4: req.ip || req.connection.remoteAddress || null
    };

    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  }

  /**
   * Handle Google OAuth callback
   * @route GET /api/auth/google/callback
   */
  static googleCallback(req, res, next) {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || 
        !process.env.GOOGLE_CLIENT_SECRET || 
        process.env.GOOGLE_CLIENT_ID === 'your-google-client-id' ||
        process.env.GOOGLE_CLIENT_SECRET === 'your-google-client-secret') {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Google OAuth not configured`);
    }

    passport.authenticate('google', { session: false }, async (err, authData) => {
      try {
        if (err) {
          console.error('Google OAuth error:', err);
          return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
        }

        if (!authData) {
          return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication cancelled`);
        }

        const { user, isNewUser, socialAccount, linkedExisting } = authData;

        // Get device info from session
        const deviceInfo = req.session?.deviceInfo || {};

        // If new user, assign free subscription
        if (isNewUser) {
          // Assign free subscription asynchronously (non-blocking)
          setImmediate(async () => {
            try {
              const freePlan = await subscriptionRepository.findPlanBySlug('free');
              
              if (freePlan) {
                const activatedAt = new Date();
                const endsAt = new Date();
                const durationDays = freePlan.durationDays || 30;
                endsAt.setDate(endsAt.getDate() + durationDays);

                await subscriptionRepository.createSubscription({
                  userId: user.id,
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
                }, user.id);
              }
            } catch (error) {
              console.error('Failed to assign free plan:', error.message);
            }
          });
        }

        // Generate JWT tokens
        const tokens = generateTokens({
          userId: user.id,
          roleId: user.roleId,
          roleSlug: user.role.slug,
          mobile: user.mobile,
          email: user.email
        });

        // Create session record
        await authService.createSession({
          userId: user.id,
          refreshToken: tokens.refresh_token,
          deviceName: deviceInfo.deviceName,
          userAgent: deviceInfo.userAgent,
          ipAddressV4: deviceInfo.ipAddressV4,
          isActive: true
        });

        // Update last login
        if (!isNewUser) {
          await authService.updateLastLogin(user.id);
        }

        // Prepare response data
        const responseData = {
          user: {
            id: user.id,
            fullName: user.fullName,
            mobile: user.mobile,
            countryCode: user.countryCode,
            email: user.email,
            role: user.role.slug,
            profile_image: socialAccount?.profilePictureUrl || user.profilePhoto,
            last_login_at: isNewUser ? null : new Date().toISOString(),
            isPhoneVerified: user.isPhoneVerified,
            isEmailVerified: user.isEmailVerified
          },
          tokens,
          authMethod: 'google',
          isNewUser,
          linkedExisting: linkedExisting || false
        };

        // Clear session device info
        if (req.session) {
          delete req.session.deviceInfo;
        }

        // Encode response data for URL
        const encodedData = encodeURIComponent(JSON.stringify({
          success: true,
          message: isNewUser ? SUCCESS_MESSAGES.REGISTRATION_SUCCESS : SUCCESS_MESSAGES.LOGIN_SUCCESS,
          data: responseData
        }));

        // Redirect to frontend with success data
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?data=${encodedData}`);

      } catch (error) {
        console.error('Google callback error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication processing failed`);
      }
    })(req, res, next);
  }

  /**
   * Handle mobile number collection for Google users
   * @route POST /api/auth/google/complete-profile
   */
  static async completeProfile(req, res) {
    try {
      const { mobile, countryCode = '+91' } = req.body;
      const userId = req.user.userId;

      // Validate mobile number
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Valid 10-digit mobile number is required',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // Check if mobile already exists
      const existingUser = await authService.findByMobile(mobile);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already registered with another account',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // Update user with mobile number
      await authService.updateUserMobile(userId, mobile, countryCode);

      // Get updated user data
      const updatedUser = await authService.getProfile(userId);

      return res.status(200).json({
        success: true,
        message: 'Profile completed successfully',
        data: updatedUser.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default GoogleAuthController;