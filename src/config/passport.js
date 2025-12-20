import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import authRepository from '#repositories/authRepository.js';
import db from '#models/index.js';

/**
 * Passport configuration for Google OAuth
 */

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Extract user data from Google profile
    const googleData = {
      providerId: profile.id,
      email: profile.emails?.[0]?.value || null,
      fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
      profilePictureUrl: profile.photos?.[0]?.value || null,
      accessToken,
      refreshToken
    };

    // Check if user already exists with this Google account
    const existingSocialAccount = await db.UserSocialAccount.findOne({
      where: {
        provider: 'google',
        providerId: profile.id
      },
      include: [{
        model: db.User,
        as: 'user',
        include: [{
          model: db.Role,
          as: 'role'
        }]
      }]
    });

    if (existingSocialAccount) {
      // User exists, update tokens and return
      await existingSocialAccount.update({
        accessToken,
        refreshToken,
        email: googleData.email,
        profilePictureUrl: googleData.profilePictureUrl
      });

      return done(null, {
        user: existingSocialAccount.user,
        isNewUser: false,
        socialAccount: existingSocialAccount
      });
    }

    // Check if user exists with same email
    let existingUser = null;
    if (googleData.email) {
      existingUser = await authRepository.findByEmail(googleData.email);
    }

    if (existingUser) {
      // Link Google account to existing user
      const socialAccount = await db.UserSocialAccount.create({
        userId: existingUser.id,
        provider: 'google',
        providerId: profile.id,
        email: googleData.email,
        profilePictureUrl: googleData.profilePictureUrl,
        profilePictureStorageType: 'external',
        isPrimary: true,
        accessToken,
        refreshToken
      });

      // Fetch user with role
      const userWithRole = await authRepository.findById(existingUser.id);

      return done(null, {
        user: userWithRole,
        isNewUser: false,
        socialAccount,
        linkedExisting: true
      });
    }

    // Create new user
    const defaultRole = await authRepository.getDefaultRole();
    if (!defaultRole) {
      return done(new Error('Default user role not found'), null);
    }

    // Generate random password for social login users
    const crypto = await import('crypto');
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    // Create new user
    const newUser = await authRepository.create({
      fullName: googleData.fullName || 'Google User',
      email: googleData.email,
      passwordHash,
      roleId: defaultRole.id,
      isEmailVerified: googleData.email ? true : false,
      emailVerifiedAt: googleData.email ? new Date() : null,
      mobile: null, // Will be collected later if needed
      countryCode: '+91'
    });

    // Create social account record
    const socialAccount = await db.UserSocialAccount.create({
      userId: newUser.id,
      provider: 'google',
      providerId: profile.id,
      email: googleData.email,
      profilePictureUrl: googleData.profilePictureUrl,
      profilePictureStorageType: 'external',
      isPrimary: true,
      accessToken,
      refreshToken
    });

    // Fetch user with role
    const userWithRole = await authRepository.findById(newUser.id);

    return done(null, {
      user: userWithRole,
      isNewUser: true,
      socialAccount
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((data, done) => {
  done(null, data);
});

// Deserialize user from session
passport.deserializeUser((data, done) => {
  done(null, data);
});

export default passport;