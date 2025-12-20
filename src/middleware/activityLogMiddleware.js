import activityLogService from '#services/activityLogService.js';

/**
 * Middleware to extract common activity data from request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const activityLogMiddleware = (req, res, next) => {
  // Extract common data for activity logging
  req.activityData = {
    userId: req.user?.id || null,
    sessionId: req.sessionID || req.headers['x-session-id'] || activityLogService.generateSessionId(),
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  // Add helper function to log activity
  req.logActivity = async (activityType, targetId, targetType, metadata = {}) => {
    try {
      await activityLogService.logActivity({
        ...req.activityData,
        activityType,
        targetId,
        targetType,
        metadata
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error - activity logging should not break the main flow
    }
  };

  // Add helper function to log listing view
  req.logListingView = async (listingId, metadata = {}) => {
    try {
      await activityLogService.logListingView({
        ...req.activityData,
        listingId,
        metadata
      });
    } catch (error) {
      console.error('Failed to log listing view:', error);
    }
  };

  // Add helper function to log chat initiation
  req.logChatInitiation = async (listingId, metadata = {}) => {
    try {
      await activityLogService.logChatInitiation({
        ...req.activityData,
        listingId,
        metadata
      });
    } catch (error) {
      console.error('Failed to log chat initiation:', error);
    }
  };

  next();
};

export default activityLogMiddleware;