import logger from '#config/logger.js';
import { errorResponse } from '#utils/responseFormatter.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Centralized error handling middleware
 * Catches all unhandled errors in the middleware pipeline
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error with request context
  const errorContext = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };

  // Log error using Winston
  logger.error(`${err.message}`, errorContext);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Environment-aware error formatting
  if (NODE_ENV === 'development') {
    // Development mode: Return detailed error information including stack trace
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error',
      data: null,
      error: {
        statusCode,
        stack: err.stack,
        details: err.details || null
      }
    });
  } else {
    // Production mode: Return generic error messages without sensitive details
    let message = 'Internal server error';

    // Provide specific messages for common error types
    if (statusCode === 400) {
      message = err.message || 'Bad request';
    } else if (statusCode === 401) {
      message = 'Unauthorized access';
    } else if (statusCode === 403) {
      message = 'Access forbidden';
    } else if (statusCode === 404) {
      message = err.message || 'Resource not found';
    } else if (statusCode === 422) {
      message = err.message || 'Validation failed';
    } else if (statusCode >= 500) {
      // Don't expose internal error messages in production
      message = 'Internal server error';
    } else {
      // For other status codes, use the error message if available
      message = err.message || 'An error occurred';
    }

    return errorResponse(res, message, statusCode);
  }
};

export default errorHandler;
