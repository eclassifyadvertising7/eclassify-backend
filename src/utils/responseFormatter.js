/**
 * Standardized API response formatters
 * All responses follow a consistent structure with success, message, and data fields
 */

/**
 * Success response (200)
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 */
export const successResponse = (res, data, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 */
export const createResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response with custom status code
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
export const errorResponse = (res, message = 'Internal server error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
export const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    data: null
  });
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    data: null
  });
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
export const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    data: null
  });
};

/**
 * Payment required response (402)
 * @param {Object} res - Express response object
 * @param {string} message - Payment required message
 * @param {*} data - Optional data (e.g., saved draft listing)
 */
export const paymentRequiredResponse = (res, message = 'Payment required', data = null) => {
  return res.status(402).json({
    success: false,
    message,
    data
  });
};

/**
 * Validation error response (422)
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 */
export const validationErrorResponse = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    data: { errors }
  });
};

/**
 * Paginated response (200)
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {Object} pagination - Pagination metadata
 * @param {number} pagination.page - Current page number
 * @param {number} pagination.limit - Items per page
 * @param {number} pagination.total - Total number of items
 * @param {number} pagination.totalPages - Total number of pages
 * @param {string} message - Success message
 */
export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages
    }
  });
};
