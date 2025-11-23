import jwt from 'jsonwebtoken';

/**
 * JWT Helper utilities for token generation and verification
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate access token with user data
 * @param {Object} payload - User data to encode in token
 * @param {number} payload.userId - User ID
 * @param {number} payload.roleId - Role ID
 * @param {string} payload.roleSlug - Role slug
 * @param {string} payload.mobile - User mobile number
 * @param {string} payload.email - User email (optional)
 * @returns {string} JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * Generate refresh token with user data
 * @param {Object} payload - User data to encode in token
 * @param {number} payload.userId - User ID
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign({ userId: payload.userId }, JWT_REFRESH_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRY 
  });
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - User data to encode in tokens
 * @returns {Object} Object containing access_token, refresh_token, and token_type
 */
export const generateTokens = (payload) => {
  return {
    access_token: generateAccessToken(payload),
    refresh_token: generateRefreshToken(payload),
    token_type: 'Bearer'
  };
};

/**
 * Verify access token
 * @param {string} token - JWT access token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    throw new Error('Invalid access token');
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    throw new Error('Invalid refresh token');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
