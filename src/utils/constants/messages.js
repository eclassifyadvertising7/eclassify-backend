/**
 * Standardized message constants for API responses
 * Use these constants throughout the application for consistent messaging
 */

export const SUCCESS_MESSAGES = {
  // Server and system
  SERVER_STARTED: 'Server started successfully',
  DB_CONNECTED: 'Database connected successfully',
  
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'User registered successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  PHONE_VERIFIED: 'Phone number verified successfully',
  
  // User operations
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // Listing operations
  LISTING_CREATED: 'Listing created successfully',
  LISTING_CREATED_AS_DRAFT: 'Listing created as draft due to quota limit',
  LISTING_UPDATED: 'Listing updated successfully',
  LISTING_DELETED: 'Listing deleted successfully',
  LISTING_FETCHED: 'Listing retrieved successfully',
  LISTINGS_FETCHED: 'Listings retrieved successfully',
  LISTING_FEATURED: 'Listing featured successfully',
  LISTING_APPROVED: 'Listing approved successfully',
  LISTING_REJECTED: 'Listing rejected successfully',
  LISTING_SUBMITTED: 'Listing submitted for approval',
  LISTING_SUBMITTED_FOR_MANUAL_APPROVAL: 'Listing submitted for manual approval due to quota limit',
  LISTING_MARKED_SOLD: 'Listing marked as sold',
  
  // Listing media operations
  MEDIA_UPLOADED: 'Media uploaded successfully',
  MEDIA_DELETED: 'Media deleted successfully',
  MEDIA_REORDERED: 'Media order updated successfully',
  PRIMARY_MEDIA_SET: 'Primary media set successfully',
  
  // Category operations
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  CATEGORY_FETCHED: 'Category retrieved successfully',
  CATEGORIES_FETCHED: 'Categories retrieved successfully',
  CATEGORY_STATUS_UPDATED: 'Category status updated successfully',
  CATEGORY_FEATURED_UPDATED: 'Category featured status updated successfully',
  
  // Subscription operations
  SUBSCRIPTION_CREATED: 'Subscription created successfully',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully',
  SUBSCRIPTION_PLAN_CREATED: 'Subscription plan created successfully',
  SUBSCRIPTION_PLAN_UPDATED: 'Subscription plan updated successfully',
  SUBSCRIPTION_PLAN_DELETED: 'Subscription plan deleted successfully',
  
  // Chat operations
  MESSAGE_SENT: 'Message sent successfully',
  CHAT_ROOM_CREATED: 'Chat room created successfully',
  
  // File operations
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
  
  // Notification operations
  NOTIFICATION_CREATED: 'Notification created successfully',
  NOTIFICATIONS_CREATED: 'Notifications created successfully',
  NOTIFICATION_RETRIEVED: 'Notification retrieved successfully',
  NOTIFICATIONS_RETRIEVED: 'Notifications retrieved successfully',
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
  NOTIFICATIONS_MARKED_READ: 'Notifications marked as read',
  ALL_NOTIFICATIONS_MARKED_READ: 'All notifications marked as read',
  NOTIFICATION_DELETED: 'Notification deleted successfully',
  UNREAD_COUNT_RETRIEVED: 'Unread count retrieved successfully',
  NOTIFICATION_STATS_RETRIEVED: 'Notification statistics retrieved successfully',
  PREFERENCES_RETRIEVED: 'Notification preferences retrieved successfully',
  PREFERENCES_UPDATED: 'Notification preferences updated successfully',
  
  // Favorite operations
  FAVORITE_ADDED: 'Listing added to favorites',
  FAVORITE_REMOVED: 'Listing removed from favorites',
  FAVORITES_RETRIEVED: 'Favorites retrieved successfully',
  FAVORITE_STATUS_CHECKED: 'Favorite status checked successfully',
  FAVORITE_STATS_RETRIEVED: 'Favorite statistics retrieved successfully',
  FAVORITE_COUNT_RETRIEVED: 'Favorite count retrieved successfully',
  
  // General operations
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  CHANGES_SAVED: 'Changes saved successfully'
};

export const ERROR_MESSAGES = {
  // Server and system
  SERVER_ERROR: 'Internal server error',
  DB_CONNECTION_FAILED: 'Database connection failed',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Authentication token expired',
  TOKEN_INVALID: 'Invalid authentication token',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  ACCOUNT_SUSPENDED: 'Account has been suspended',
  OTP_EXPIRED: 'OTP has expired',
  OTP_INVALID: 'Invalid OTP',
  OTP_MAX_ATTEMPTS: 'Maximum OTP verification attempts exceeded',
  OTP_NOT_FOUND: 'OTP not found or already verified',
  OTP_SEND_FAILED: 'Failed to send OTP',
  
  // User errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_USER_DATA: 'Invalid user data provided',
  
  // Listing errors
  LISTING_NOT_FOUND: 'Listing not found',
  LISTING_EXPIRED: 'Listing has expired',
  LISTING_LIMIT_REACHED: 'Listing quota limit reached',
  INVALID_LISTING_DATA: 'Invalid listing data provided',
  INVALID_LISTING_STATUS: 'Invalid listing status',
  LISTING_NOT_APPROVED: 'Listing not approved yet',
  LISTING_ALREADY_APPROVED: 'Listing already approved',
  LISTING_ALREADY_REJECTED: 'Listing already rejected',
  LISTING_CANNOT_EDIT: 'Cannot edit listing in current status',
  
  // Listing media errors
  MEDIA_NOT_FOUND: 'Media not found',
  MEDIA_LIMIT_REACHED: 'Media upload limit reached',
  INVALID_MEDIA_TYPE: 'Invalid media type',
  PRIMARY_MEDIA_REQUIRED: 'At least one primary media is required',
  MEDIA_DELETE_FAILED: 'Failed to delete media',
  
  // Category errors
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_ALREADY_EXISTS: 'Category already exists',
  INVALID_CATEGORY_DATA: 'Invalid category data provided',
  CATEGORY_DELETE_FAILED: 'Failed to delete category',
  
  // Subscription errors
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  SUBSCRIPTION_EXPIRED: 'Subscription has expired',
  INVALID_SUBSCRIPTION_PLAN: 'Invalid subscription plan',
  PAYMENT_FAILED: 'Payment processing failed',
  SUBSCRIPTION_PLAN_NOT_FOUND: 'Subscription plan not found',
  SUBSCRIPTION_PLAN_ALREADY_EXISTS: 'Subscription plan already exists',
  NO_ACTIVE_SUBSCRIPTION: 'You need an active subscription to create listings',
  ROLLING_QUOTA_REACHED: 'You have reached your listing limit for the current period',
  
  // Chat errors
  CHAT_ROOM_NOT_FOUND: 'Chat room not found',
  MESSAGE_NOT_FOUND: 'Message not found',
  INVALID_MESSAGE: 'Invalid message content',
  
  // File errors
  FILE_UPLOAD_FAILED: 'File upload failed',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_NOT_FOUND: 'File not found',
  
  // Validation errors
  INVALID_REQUEST: 'Invalid request data',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  INVALID_PHONE_FORMAT: 'Invalid phone number format',
  PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
  
  // Permission errors
  FORBIDDEN: 'Access forbidden',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  RESOURCE_IN_USE: 'Resource is currently in use',
  
  // Notification errors
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  NOTIFICATION_CREATE_FAILED: 'Failed to create notification',
  NOTIFICATIONS_CREATE_FAILED: 'Failed to create notifications',
  NOTIFICATIONS_FETCH_FAILED: 'Failed to fetch notifications',
  NOTIFICATION_UPDATE_FAILED: 'Failed to update notification',
  NOTIFICATIONS_UPDATE_FAILED: 'Failed to update notifications',
  NOTIFICATION_DELETE_FAILED: 'Failed to delete notification',
  UNREAD_COUNT_FAILED: 'Failed to get unread count',
  NOTIFICATION_STATS_FAILED: 'Failed to get notification statistics',
  PREFERENCES_FETCH_FAILED: 'Failed to fetch notification preferences',
  PREFERENCES_UPDATE_FAILED: 'Failed to update notification preferences',
  
  // Favorite errors
  FAVORITE_ALREADY_EXISTS: 'Listing is already in your favorites',
  FAVORITE_NOT_FOUND: 'Listing not found in your favorites',
  FAVORITE_OWN_LISTING: 'You cannot favorite your own listing',
  FAVORITE_INACTIVE_LISTING: 'Only active listings can be favorited',
  FAVORITE_ADD_FAILED: 'Failed to add listing to favorites',
  FAVORITE_REMOVE_FAILED: 'Failed to remove listing from favorites',
  FAVORITES_FETCH_FAILED: 'Failed to retrieve favorites',
  FAVORITE_STATUS_FAILED: 'Failed to check favorite status',
  FAVORITE_STATS_FAILED: 'Failed to retrieve favorite statistics',
  
  // General errors
  OPERATION_FAILED: 'Operation failed',
  NOT_IMPLEMENTED: 'Feature not implemented yet',
  MAINTENANCE_MODE: 'System is under maintenance'
};
