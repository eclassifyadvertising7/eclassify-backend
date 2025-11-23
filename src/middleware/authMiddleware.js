import { verifyAccessToken } from '#utils/jwtHelper.js';
import { ERROR_MESSAGES } from '#utils/constants/messages.js';

/**
 * Verify JWT access token and attach user data to request
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    // Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Check if user has required role
 * @param {Array<string>} allowedRoles - Array of allowed role slugs
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // Super admin has access to everything
    if (req.user.roleSlug === 'super_admin') {
      return next();
    }

    // Check if user's role is in allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.roleSlug)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};
