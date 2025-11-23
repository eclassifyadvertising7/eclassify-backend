import { ERROR_MESSAGES } from '#utils/constants/messages.js';

/**
 * Role-based access control middleware
 * Checks if authenticated user has one of the allowed roles
 * 
 * @param {Array<string>} allowedRoles - Array of allowed role slugs (e.g., ['super_admin', 'admin'])
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/admin-only', authenticate, allowRoles(['super_admin', 'admin']), controller);
 */
export const allowRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    // Check if user is authenticated
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

/**
 * Check if user has a specific permission
 * For future implementation with permission-based access control
 * 
 * @param {string} permissionSlug - Permission slug to check
 * @returns {Function} Express middleware function
 */
export const requirePermission = (permissionSlug) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // Super admin bypasses permission checks
    if (req.user.roleSlug === 'super_admin') {
      return next();
    }

    // TODO: Implement permission check against role_permissions table
    // For now, just pass through
    // const hasPermission = await checkPermission(req.user.roleId, permissionSlug);
    // if (!hasPermission) {
    //   return res.status(403).json({
    //     success: false,
    //     message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
    //     data: null
    //   });
    // }

    next();
  };
};
