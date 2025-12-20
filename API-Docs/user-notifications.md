# User Notifications API Documentation

## Overview

The User Notifications system provides real-time and scheduled notifications to users about various platform activities including listing updates, chat messages, subscription changes, and system announcements.

## Features

- **Real-time notifications** via Socket.io
- **Multi-channel delivery** (in-app, email, push, SMS)
- **User preferences** for notification types and channels
- **Scheduled notifications** for reminders and announcements
- **Notification categories** for organized filtering
- **Read/unread status** tracking
- **Bulk operations** for admin broadcasts

## Notification Categories

- `listing` - Listing-related notifications (approved, rejected, expired, etc.)
- `chat` - Chat and messaging notifications (new messages, offers, etc.)
- `subscription` - Subscription and billing notifications (expiry, payments, etc.)
- `system` - System announcements and updates
- `security` - Security and account notifications (login alerts, etc.)
- `marketing` - Promotional notifications and offers

## Notification Types

### Listing Category
- `listing_approved` - Listing approved by admin
- `listing_rejected` - Listing rejected by admin
- `listing_expired` - Listing expired (30 days)
- `listing_expiring_soon` - Listing expiring in 3 days
- `listing_featured` - Listing featured by admin
- `listing_view_milestone` - Listing reached view milestone
- `listing_offer_received` - New offer received on listing

### Chat Category
- `new_message` - New chat message received
- `offer_made` - New offer made in chat
- `offer_accepted` - Offer accepted
- `offer_rejected` - Offer rejected
- `contact_requested` - Buyer requested contact info
- `contact_shared` - Seller shared contact info

### Subscription Category
- `subscription_activated` - New subscription activated
- `subscription_expiring` - Subscription expiring soon
- `subscription_expired` - Subscription expired
- `subscription_renewed` - Subscription auto-renewed
- `quota_warning` - Listing quota 80% used
- `quota_exceeded` - Listing quota exceeded
- `payment_successful` - Payment completed
- `payment_failed` - Payment failed
- `invoice_generated` - New invoice generated

### System Category
- `maintenance_scheduled` - Scheduled maintenance
- `feature_announcement` - New feature announcement
- `policy_update` - Terms/policy updates

### Security Category
- `login_new_device` - Login from new device
- `password_changed` - Password changed
- `account_suspended` - Account suspended
- `suspicious_activity` - Suspicious activity detected

### Marketing Category
- `promotion_available` - Special promotion available
- `feature_suggestion` - Suggested features/upgrades
- `seasonal_offer` - Seasonal offers

---

## End-User Endpoints

### Get User Notifications

**GET** `/api/end-user/notifications`

Get paginated list of user's notifications with optional filters.

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20, max: 100)
- `status` (string, optional) - Filter by status: `unread`, `read`
- `category` (string, optional) - Filter by category: `listing`, `chat`, `subscription`, `system`, `security`, `marketing`
- `notificationType` (string, optional) - Filter by specific notification type
- `isRead` (boolean, optional) - Filter by read status: `true`, `false`
- `startDate` (string, optional) - Filter from date (ISO format)
- `endDate` (string, optional) - Filter to date (ISO format)
- `includeExpired` (boolean, optional) - Include expired notifications (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 123,
      "notificationType": "listing_approved",
      "category": "listing",
      "title": "Your listing has been approved!",
      "message": "Your car listing 'Honda City 2020' is now live and visible to buyers.",
      "data": {
        "listingTitle": "Honda City 2020",
        "listingSlug": "honda-city-2020-abc123",
        "approvedBy": "admin_name",
        "expiresAt": "2025-01-15T10:30:00Z"
      },
      "listingId": 12345,
      "status": "unread",
      "priority": "high",
      "isRead": false,
      "readAt": null,
      "expiresAt": null,
      "createdAt": "2025-01-01T10:30:00Z",
      "updatedAt": "2025-01-01T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Single Notification

**GET** `/api/end-user/notifications/:id`

Get details of a specific notification.

**Response:**
```json
{
  "success": true,
  "message": "Notification retrieved successfully",
  "data": {
    "id": 123,
    "notificationType": "new_message",
    "category": "chat",
    "title": "New message from John",
    "message": "You have a new message about your Honda City listing.",
    "data": {
      "senderName": "John Doe",
      "listingTitle": "Honda City 2020",
      "messagePreview": "Is this car still available?",
      "chatRoomId": 789
    },
    "listingId": 12345,
    "chatRoomId": 789,
    "status": "unread",
    "priority": "normal",
    "isRead": false,
    "readAt": null,
    "createdAt": "2025-01-01T10:30:00Z"
  }
}
```

### Get Unread Count

**GET** `/api/end-user/notifications/unread-count`

Get count of unread notifications, total and by category.

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "total": 15,
    "byCategory": {
      "listing": 5,
      "chat": 8,
      "subscription": 2,
      "system": 0,
      "security": 0,
      "marketing": 0
    }
  }
}
```

### Mark Notification as Read

**PATCH** `/api/end-user/notifications/:id/read`

Mark a specific notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notificationId": 123,
    "readAt": "2025-01-01T11:00:00Z"
  }
}
```

### Mark Multiple Notifications as Read

**PATCH** `/api/end-user/notifications/mark-multiple-read`

Mark multiple notifications as read in a single request.

**Request Body:**
```json
{
  "notificationIds": [123, 124, 125]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications marked as read",
  "data": {
    "count": 3,
    "readAt": "2025-01-01T11:00:00Z"
  }
}
```

### Mark All Notifications as Read

**PATCH** `/api/end-user/notifications/mark-all-read`

Mark all unread notifications as read for the user.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "count": 15,
    "readAt": "2025-01-01T11:00:00Z"
  }
}
```

### Delete Notification

**DELETE** `/api/end-user/notifications/:id`

Delete a specific notification (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "notificationId": 123
  }
}
```

### Get Notification Statistics

**GET** `/api/end-user/notifications/stats?days=30`

Get notification statistics for the user over a specified period.

**Query Parameters:**
- `days` (integer, optional) - Number of days to analyze (default: 30, max: 365)

**Response:**
```json
{
  "success": true,
  "message": "Notification statistics retrieved successfully",
  "data": {
    "stats": {
      "listing": {
        "unread": 5,
        "read": 20
      },
      "chat": {
        "unread": 8,
        "read": 45
      },
      "subscription": {
        "unread": 2,
        "read": 10
      }
    },
    "period": "30 days"
  }
}
```

### Get User Notification Preferences

**GET** `/api/end-user/notifications/preferences`

Get user's notification preferences for all categories and channels.

**Response:**
```json
{
  "success": true,
  "message": "Notification preferences retrieved successfully",
  "data": {
    "id": 456,
    "userId": 123,
    "notificationsEnabled": true,
    "listingNotificationsEnabled": true,
    "chatNotificationsEnabled": true,
    "subscriptionNotificationsEnabled": true,
    "systemNotificationsEnabled": true,
    "securityNotificationsEnabled": true,
    "marketingNotificationsEnabled": false,
    "createdAt": "2025-01-01T10:30:00Z",
    "updatedAt": "2025-01-01T10:30:00Z"
  }
}
```

**Note:** Channel preferences (email, push, SMS) are managed internally and not exposed to users for simplicity.

### Update User Notification Preferences

**PUT** `/api/end-user/notifications/preferences`

Update user's notification preferences.

**Request Body:**
```json
{
  "notificationsEnabled": true,
  "listingNotificationsEnabled": true,
  "chatNotificationsEnabled": false,
  "subscriptionNotificationsEnabled": true,
  "systemNotificationsEnabled": true,
  "securityNotificationsEnabled": true,
  "marketingNotificationsEnabled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "id": 456,
    "userId": 123,
    "notificationsEnabled": true,
    "listingNotificationsEnabled": true,
    "chatNotificationsEnabled": false,
    "subscriptionNotificationsEnabled": true,
    "systemNotificationsEnabled": true,
    "securityNotificationsEnabled": true,
    "marketingNotificationsEnabled": false,
    "updatedAt": "2025-01-01T11:00:00Z"
  }
}
```

**Note:** Users can only control notification categories. Delivery channels (email, push, SMS) are managed by the system.

---

## Panel (Admin) Endpoints

### Send Broadcast Notification

**POST** `/api/panel/notifications/broadcast`

Send notification to multiple users (admin only).

**Request Body:**
```json
{
  "userIds": [123, 124, 125],
  "notificationType": "feature_announcement",
  "category": "system",
  "title": "New feature: Advanced Search",
  "message": "We've added advanced search filters to help you find listings faster.",
  "data": {
    "featureName": "Advanced Search",
    "description": "Filter by price range, year, mileage and more",
    "learnMoreUrl": "/features/advanced-search"
  },
  "priority": "normal",
  "scheduledFor": "2025-01-02T10:00:00Z",
  "expiresAt": "2025-01-10T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications created successfully",
  "data": {
    "count": 3,
    "notifications": [...]
  }
}
```

### Send Notification to User

**POST** `/api/panel/notifications/users/:userId`

Send notification to a specific user (admin only).

**Request Body:**
```json
{
  "notificationType": "account_verified",
  "category": "system",
  "title": "Account verified",
  "message": "Your account has been successfully verified by our team.",
  "data": {
    "verifiedBy": "admin_name",
    "verifiedAt": "2025-01-01T10:30:00Z"
  },
  "priority": "high"
}
```

### Get User Notifications (Admin View)

**GET** `/api/panel/notifications/users/:userId`

Get user's notifications from admin perspective (includes expired notifications).

**Query Parameters:** Same as end-user endpoint, plus:
- `includeExpired` (boolean, optional) - Include expired notifications (default: true for admin)

### Get Notification Statistics (Admin)

**GET** `/api/panel/notifications/stats?days=30`

Get system-wide notification statistics for admin dashboard.

**Response:**
```json
{
  "success": true,
  "message": "Notification statistics retrieved successfully",
  "data": {
    "totalNotifications": 15420,
    "notificationsByCategory": {
      "listing": 8500,
      "chat": 4200,
      "subscription": 1800,
      "system": 520,
      "security": 300,
      "marketing": 100
    },
    "notificationsByType": {
      "listing_approved": 3200,
      "new_message": 2800,
      "listing_expired": 1500
    },
    "deliveryStats": {
      "email": { "sent": 12000, "failed": 120 },
      "push": { "sent": 8500, "failed": 85 },
      "sms": { "sent": 2000, "failed": 50 }
    },
    "period": "30 days"
  }
}
```

### Get User Preferences (Admin View)

**GET** `/api/panel/notifications/users/:userId/preferences`

Get user's notification preferences from admin perspective.

### Update User Preferences (Admin)

**PUT** `/api/panel/notifications/users/:userId/preferences`

Update user's notification preferences (admin action).

### Process Scheduled Notifications

**POST** `/api/panel/notifications/process-scheduled`

Manually trigger processing of scheduled notifications (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Processed 15 scheduled notifications",
  "data": {
    "processedCount": 15,
    "totalFound": 15
  }
}
```

### Cleanup Expired Notifications

**POST** `/api/panel/notifications/cleanup-expired`

Manually trigger cleanup of expired notifications (admin only).

**Request Body:**
```json
{
  "olderThanDays": 180
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 1250 expired notifications",
  "data": {
    "deletedCount": 1250
  }
}
```

---

## Real-time Notifications (Socket.io)

### Events

#### Receive Notification

**Event:** `notification`

Emitted when a new notification is created for the user.

**Payload:**
```json
{
  "id": 123,
  "type": "listing_approved",
  "title": "Your listing has been approved!",
  "message": "Your car listing is now live...",
  "data": { ... },
  "created_at": "2025-01-01T10:30:00Z"
}
```

#### Notification Read

**Event:** `notification_read`

Emitted when a notification is marked as read.

**Payload:**
```json
{
  "notificationId": 123,
  "readAt": "2025-01-01T11:00:00Z"
}
```

#### Unread Count Update

**Event:** `unread_count_update`

Emitted when unread count changes.

**Payload:**
```json
{
  "total": 14,
  "byCategory": { ... }
}
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common Error Codes

- `400` - Bad Request (validation errors, invalid parameters)
- `401` - Unauthorized (invalid or missing authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (notification not found)
- `500` - Internal Server Error

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "notificationIds",
      "message": "Valid notification IDs array is required"
    }
  ]
}
```

---

## Rate Limits

- **End-user endpoints:** 100 requests per minute per user
- **Admin endpoints:** 500 requests per minute per admin
- **Bulk operations:** 10 requests per minute per admin

---

## Backend Integration

### Creating Notifications in Services

Use the notification helper service to create notifications from your existing services:

```javascript
import notificationHelperService from '#services/notificationHelperService.js';

// In listing service when listing is approved
await notificationHelperService.notifyListingApproved(
  listing.userId,
  listing,
  req.user.userId
);

// In chat service when new message is sent
await notificationHelperService.notifyNewMessage(
  recipientUserId,
  {
    chatRoomId: chatRoom.id,
    listingId: chatRoom.listingId,
    senderName: sender.fullName,
    listingTitle: listing.title
  },
  message.messageText.substring(0, 100)
);
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Notification data field contains type-specific information
- Expired notifications are automatically hidden from end-users but visible to admins
- Soft delete is used - notifications are never permanently deleted immediately
- Scheduled notifications are processed every 5 minutes
- Cleanup job runs daily at 2 AM to remove old notifications (6+ months)
- User preferences are created with defaults when first accessed
- Quiet hours respect user's timezone setting
- Rate limiting prevents notification spam