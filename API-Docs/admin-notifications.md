# Admin Notification System API

## Overview

Super admin can send notifications to users through multiple channels: in-app, email, and push notifications (FCM). Notifications are delivered in real-time via Socket.io for in-app delivery.

## Authentication

All endpoints require:
- Valid JWT token
- Super admin role (except stats endpoint which allows admin role)

## Endpoints

### 1. Get All Roles

Get list of all roles for notification targeting.

**Endpoint:** `GET /api/panel/roles`

**See:** `API-Docs/roles.md` for complete role management API documentation.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": {
    "roles": [
      {
        "id": 1,
        "name": "Super Admin",
        "slug": "super_admin",
        "isActive": true
      },
      {
        "id": 3,
        "name": "User",
        "slug": "user",
        "isActive": true
      }
    ]
  }
}
```

---

### 2. Get Users by Role

Get users assigned to a specific role for targeted notifications.

**Endpoint:** `GET /api/panel/roles/users/:roleId?page=1&limit=100&search=john`

**See:** `API-Docs/roles.md` for complete role management API documentation.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by name, email, or mobile (supports partial matching)
- `status` (optional): Filter by user status (active/inactive/suspended)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "role": {
      "id": 3,
      "name": "User",
      "slug": "user"
    },
    "users": [
      {
        "id": 123,
        "fullName": "John Doe",
        "email": "john@example.com",
        "mobile": "9175113022",
        "isActive": true,
        "status": "active"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 100,
      "totalPages": 2
    }
  }
}
```

---

### 3. Send Broadcast Notification

Send notification to specific users with multiple delivery channels.

**Endpoint:** `POST /api/panel/notifications/broadcast`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (Send to Specific Users):**
```json
{
  "targetType": "specific",
  "userIds": [123, 456, 789],
  "title": "System Maintenance Notice",
  "message": "The system will undergo maintenance on Dec 27, 2025 from 2 AM to 4 AM.",
  "category": "system",
  "priority": "high",
  "deliveryMethods": ["in_app", "email"],
  "actionUrl": "https://yourapp.com/maintenance-info",
  "data": {
    "maintenanceDate": "2025-12-27",
    "duration": "2 hours"
  },
  "scheduledFor": null,
  "expiresAt": "2025-12-28T00:00:00Z"
}
```

**Request Body (Send to All Users):**
```json
{
  "targetType": "all",
  "title": "System Maintenance Notice",
  "message": "The system will undergo maintenance on Dec 27, 2025 from 2 AM to 4 AM.",
  "category": "system",
  "priority": "high",
  "deliveryMethods": ["in_app", "email"],
  "actionUrl": "https://yourapp.com/maintenance-info",
  "expiresAt": "2025-12-28T00:00:00Z"
}
```

**Request Fields:**
- `targetType` (optional): Target type - `all` (all active users) or `specific` (selected users) (default: `specific`)
- `userIds` (required if targetType is 'specific'): Array of user IDs to send notification to
- `title` (required): Notification title
- `message` (required): Notification message content
- `category` (optional): Category - `listing`, `chat`, `subscription`, `system`, `security`, `marketing` (default: `system`)
- `priority` (optional): Priority level - `low`, `normal`, `high`, `urgent` (default: `normal`)
- `deliveryMethods` (required): Array of delivery channels - `in_app`, `email`, `push`
- `actionUrl` (optional): URL for action button in notification
- `data` (optional): Additional metadata object
- `scheduledFor` (optional): ISO date string for scheduled delivery
- `expiresAt` (optional): ISO date string for notification expiration

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "data": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "deliveryResults": {
      "in_app": { "sent": 3, "failed": 0 },
      "email": { "sent": 3, "failed": 0 },
      "push": { "sent": 0, "failed": 0 }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Not super admin
- `500 Internal Server Error`: Server error

---

### 4. Send Notification to Single User

Send notification to a specific user.

**Endpoint:** `POST /api/panel/notifications/users/:userId`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationType": "listing_approved",
  "category": "listing",
  "title": "Your listing has been approved",
  "message": "Congratulations! Your listing 'Toyota Camry 2020' has been approved and is now live.",
  "priority": "normal",
  "listingId": 456,
  "data": {
    "listingTitle": "Toyota Camry 2020",
    "approvedBy": "Admin"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": 789,
    "userId": 123,
    "title": "Your listing has been approved",
    "createdAt": "2025-12-26T10:30:00Z"
  }
}
```

---

### 5. Get Notification Statistics

Get notification delivery statistics for admin dashboard.

**Endpoint:** `GET /api/panel/notifications/stats?days=30`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `days` (optional): Number of days to include (1-365, default: 30)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification statistics retrieved",
  "data": {
    "totalNotifications": 1250,
    "notificationsByCategory": {
      "listing": 450,
      "chat": 200,
      "subscription": 150,
      "system": 300,
      "security": 50,
      "marketing": 100
    },
    "notificationsByType": {
      "listing_approved": 200,
      "listing_rejected": 50,
      "system_announcement": 100
    },
    "deliveryStats": {
      "email": { "sent": 800, "failed": 20 },
      "push": { "sent": 1000, "failed": 10 },
      "sms": { "sent": 300, "failed": 5 }
    },
    "period": "30 days"
  }
}
```

---

### 6. Get User Notifications (Admin View)

View all notifications for a specific user.

**Endpoint:** `GET /api/panel/notifications/users/:userId?page=1&limit=20`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `isRead` (optional): Filter by read status (true/false)
- `includeExpired` (optional): Include expired notifications (default: true)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 789,
      "notificationType": "listing_approved",
      "category": "listing",
      "title": "Your listing has been approved",
      "message": "Congratulations! Your listing is now live.",
      "isRead": false,
      "priority": "normal",
      "createdAt": "2025-12-26T10:30:00Z"
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

---

### 7. Process Scheduled Notifications

Manually trigger processing of scheduled notifications.

**Endpoint:** `POST /api/panel/notifications/process-scheduled`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Scheduled notifications processed successfully",
  "data": {
    "processed": 15,
    "failed": 0
  }
}
```

---

### 8. Cleanup Expired Notifications

Remove old expired notifications from database.

**Endpoint:** `POST /api/panel/notifications/cleanup-expired`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "olderThanDays": 180
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expired notifications cleaned up successfully",
  "data": {
    "deleted": 450
  }
}
```

---

## Delivery Methods

### In-App Notifications
- Stored in database
- Delivered via Socket.io in real-time
- User receives `notification_count_update` event
- Visible in user's notification center
- Works for web and mobile apps

### Email Notifications
- Sent via configured SMTP server (Nodemailer)
- HTML formatted with app branding
- Includes action button if `actionUrl` provided
- Async delivery (doesn't block response)

### Push Notifications (FCM)
- Firebase Cloud Messaging for mobile devices
- Requires FCM token stored for each user device
- Supports Android and iOS
- Currently placeholder - requires FCM setup
- Set `PUSH_ENABLED=true` when configured

---

## Notification Categories

- `listing`: Listing-related notifications (approved, rejected, expired)
- `chat`: Chat and messaging notifications
- `subscription`: Subscription and payment notifications
- `system`: System announcements and maintenance
- `security`: Security alerts and account changes
- `marketing`: Promotional and marketing messages

---

## Priority Levels

- `low`: Non-urgent informational messages
- `normal`: Standard notifications (default)
- `high`: Important notifications requiring attention
- `urgent`: Critical alerts requiring immediate action

---

## Real-Time Delivery

When in-app delivery is selected:
1. Notification created in database
2. Socket.io emits `notification_count_update` to user
3. User's notification badge updates instantly
4. User can view notification in notification center

When push delivery is selected:
1. Fetch user's FCM tokens from database
2. Send push notification via Firebase Admin SDK
3. Notification appears in device notification tray
4. Works even when app is closed

**Socket Event:**
```javascript
socket.on('notification_count_update', (data) => {
  // data = { count: 13, timestamp: "2025-12-26T10:30:00Z" }
  updateNotificationBadge(data.count);
});
```

---

## Use Cases

### System Maintenance Announcement
```json
{
  "userIds": [/* all active users */],
  "title": "Scheduled Maintenance",
  "message": "System will be down for maintenance...",
  "category": "system",
  "priority": "high",
  "deliveryMethods": ["in_app", "email"],
  "expiresAt": "2025-12-28T00:00:00Z"
}
```

### Listing Approval Notification
```json
{
  "userIds": [123],
  "title": "Listing Approved",
  "message": "Your listing has been approved and is now live.",
  "category": "listing",
  "priority": "normal",
  "deliveryMethods": ["in_app", "email", "push"],
  "actionUrl": "https://app.com/listings/456"
}
```

### Promotional Campaign
```json
{
  "userIds": [/* premium users */],
  "title": "Special Offer: 50% Off Premium",
  "message": "Upgrade to premium and get 50% off...",
  "category": "marketing",
  "priority": "low",
  "deliveryMethods": ["in_app", "email"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

**Common Errors:**
- Missing required fields
- Invalid user IDs
- Invalid delivery methods
- Invalid category or priority
- Unauthorized access
- Server errors

---

## Notes

- Push notifications require FCM setup and user device tokens
- Email requires SMTP credentials in environment variables
- In-app notifications are always delivered if user is online
- Failed deliveries are logged but don't block the response
- Scheduled notifications are processed by cron job
- Expired notifications can be cleaned up manually or via cron
