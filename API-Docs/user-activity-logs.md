# User Activity Logs API Documentation

## Overview
API endpoints for tracking and analyzing user activity logs, focusing on listing views and chat initiations for analytics and recommendations.

## Authentication
End-user endpoints support both authenticated and anonymous users. Panel endpoints require admin/staff roles.

---

## End-User Endpoints

### Log Listing View
**POST** `/api/end-user/activity/log-view`

Log when a user views a listing detail page.

**Request Body:**
```json
{
  "listingId": 12345,
  "metadata": {
    "view_duration": 45,
    "referrer_source": "search_results",
    "page_url": "/listing/12345",
    "scroll_depth": 85
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity logged successfully",
  "data": {
    "activityLogId": 67890
  }
}
```

**Metadata Fields:**
- `view_duration` (number) - Time spent on page in seconds
- `referrer_source` (string) - How user arrived: `search_results`, `category_page`, `direct_link`, `favorites`, `external`, `recommendation`
- `page_url` (string) - Full page URL
- `scroll_depth` (number) - Percentage of page scrolled (0-100)

---

### Log Chat Initiation
**POST** `/api/end-user/activity/log-chat`

Log when a user initiates chat with a seller.

**Request Body:**
```json
{
  "listingId": 12345,
  "metadata": {
    "seller_id": 67890,
    "chat_room_id": 555,
    "button_location": "listing_header"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity logged successfully",
  "data": {
    "activityLogId": 67891
  }
}
```

**Metadata Fields:**
- `seller_id` (number) - ID of the seller being contacted
- `chat_room_id` (number) - ID of created chat room (if successful)
- `button_location` (string) - Where chat was initiated: `listing_header`, `listing_footer`, `contact_section`, `floating_button`

---

### Get User Activity Summary
**GET** `/api/end-user/activity/summary`

Get authenticated user's activity summary and statistics.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Activity summary retrieved successfully",
  "data": {
    "view_listing_detail": {
      "count": 45,
      "uniqueTargets": 32
    },
    "initiate_chat": {
      "count": 8,
      "uniqueTargets": 7
    }
  }
}
```

---

## Panel Endpoints (Admin/Staff)

### Get Activity Analytics
**GET** `/api/panel/activity/analytics`

Get comprehensive activity analytics for admin dashboard.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)
- `activityType` (string, optional) - Filter by activity type: `view_listing_detail`, `initiate_chat`
- `userId` (number, optional) - Filter by specific user

**Response:**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": [
    {
      "activityType": "view_listing_detail",
      "count": 2340,
      "date": "2025-01-15"
    },
    {
      "activityType": "initiate_chat",
      "count": 156,
      "date": "2025-01-15"
    }
  ]
}
```

---

### Get Activity Logs
**GET** `/api/panel/activity/logs`

Get detailed activity logs with filtering and pagination.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 50, max: 100)
- `userId` (number, optional) - Filter by user ID
- `sessionId` (string, optional) - Filter by session ID
- `activityType` (string, optional) - Filter by activity type
- `targetId` (number, optional) - Filter by target ID (listing ID)
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)
- `ipAddress` (string, optional) - Filter by IP address

**Response:**
```json
{
  "success": true,
  "message": "Activity logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": 67890,
        "userId": 123,
        "sessionId": "sess_abc123",
        "activityType": "view_listing_detail",
        "targetId": 12345,
        "targetType": "listing",
        "metadata": {
          "view_duration": 45,
          "referrer_source": "search_results",
          "scroll_depth": 85
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-01-15T10:30:00Z",
        "user": {
          "id": 123,
          "email": "user@example.com",
          "mobile": "9175113022"
        }
      }
    ],
    "total": 1250,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Get Activity Count by Type
**GET** `/api/panel/activity/count-by-type`

Get activity counts grouped by activity type.

**Query Parameters:**
- `userId` (number, optional) - Filter by user ID
- `targetId` (number, optional) - Filter by target ID
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Activity counts retrieved successfully",
  "data": [
    {
      "activityType": "view_listing_detail",
      "count": 2340
    },
    {
      "activityType": "initiate_chat",
      "count": 156
    }
  ]
}
```

---

### Get Most Viewed Listings
**GET** `/api/panel/activity/most-viewed`

Get listings with highest view counts for analytics.

**Query Parameters:**
- `limit` (number, optional) - Number of results (default: 10, max: 50)
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Most viewed listings retrieved successfully",
  "data": [
    {
      "targetId": 12345,
      "viewCount": 245,
      "uniqueUsers": 189,
      "listing": {
        "id": 12345,
        "title": "Honda City 2020",
        "price": 850000,
        "status": "active"
      }
    }
  ]
}
```

---

### Get Conversion Rate Analytics
**GET** `/api/panel/activity/conversion-rate`

Get conversion rate from listing views to chat initiations.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)
- `targetId` (number, optional) - Filter by specific listing

**Response:**
```json
{
  "success": true,
  "message": "Conversion analytics retrieved successfully",
  "data": {
    "totalViews": 2340,
    "totalChats": 156,
    "conversionRate": 6.67
  }
}
```

---

### Get User Activity Details
**GET** `/api/panel/activity/user/:userId`

Get detailed activity breakdown for a specific user.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "User activity summary retrieved successfully",
  "data": {
    "view_listing_detail": {
      "count": 45,
      "uniqueTargets": 32
    },
    "initiate_chat": {
      "count": 8,
      "uniqueTargets": 7
    }
  }
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Missing required fields for activity logging"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Listing not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to log activity"
}
```

---

## Frontend Integration Examples

### Activity Logging Integration

```javascript
// Log listing view when user visits listing detail page
const logListingView = async (listingId, metadata = {}) => {
  try {
    await fetch('/api/end-user/activity/log-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Optional for anonymous users
      },
      body: JSON.stringify({
        listingId,
        metadata: {
          referrer_source: document.referrer ? 'external' : 'direct_link',
          page_url: window.location.href,
          view_duration: null, // Will be updated on page unload
          ...metadata
        }
      })
    });
  } catch (error) {
    console.error('Error logging view:', error);
  }
};

// Log chat initiation when user clicks chat button
const logChatInitiation = async (listingId, sellerId, buttonLocation) => {
  try {
    await fetch('/api/end-user/activity/log-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        listingId,
        metadata: {
          seller_id: sellerId,
          button_location: buttonLocation,
          chat_room_id: null // Will be updated after chat room creation
        }
      })
    });
  } catch (error) {
    console.error('Error logging chat initiation:', error);
  }
};

// Track view duration on page unload
let viewStartTime = Date.now();

window.addEventListener('beforeunload', () => {
  const viewDuration = Math.round((Date.now() - viewStartTime) / 1000);
  
  // Use sendBeacon for reliable logging on page unload
  navigator.sendBeacon('/api/end-user/activity/update-view-duration', 
    JSON.stringify({
      activityLogId: currentActivityLogId,
      viewDuration
    })
  );
});
```

---

## Notes

- Activity logging is non-blocking and should not affect user experience
- Anonymous users are tracked via session ID for basic analytics
- View duration tracking helps identify engaging content
- Conversion rate analytics help optimize listing performance
- All timestamps are in ISO 8601 format (UTC)
- Panel endpoints require appropriate role permissions
- IP addresses are logged for fraud detection and analytics
- Metadata is stored as JSONB for flexible analysis