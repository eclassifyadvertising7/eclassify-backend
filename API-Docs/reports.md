# Reports API Documentation

## 1. Report Listing

**Method:** POST  
**Endpoint:** `/api/end-user/reports/listing/:listingId`

**Request:**
```json
{
  "reportType": "spam",
  "reason": "This listing is spam and contains misleading information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing reported successfully. Our team will review it shortly.",
  "data": {
    "reportId": 123,
    "listingId": 456,
    "reportType": "spam",
    "status": "pending"
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "You have already reported this listing"
}
```

**Report Types:** `spam`, `fraud`, `offensive`, `duplicate`, `wrong_category`, `misleading`, `sold`, `other`

---

## 2. Report User

**Method:** POST  
**Endpoint:** `/api/end-user/reports/user/:userId`

**Request:**
```json
{
  "reportType": "scammer",
  "reason": "This user is a known scammer who never delivers products",
  "context": "Tried to buy a car, paid advance but never received it",
  "relatedListingId": 789,
  "relatedChatRoomId": 101
}
```

**Response:**
```json
{
  "success": true,
  "message": "User reported successfully. Our team will review it shortly.",
  "data": {
    "reportId": 124,
    "reportedUserId": 789,
    "reportType": "scammer",
    "status": "pending"
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "You cannot report yourself"
}
```

**Report Types:** `scammer`, `fake_profile`, `harassment`, `spam`, `inappropriate_behavior`, `fake_listings`, `non_responsive`, `other`

---

## 3. Get Listing Reports

**Method:** GET  
**Endpoint:** `/api/panel/reports/listings?status=pending&page=1&limit=20`

**Request:** Query parameters only

**Response:**
```json
{
  "success": true,
  "message": "Listing reports retrieved successfully",
  "data": [
    {
      "id": 123,
      "listingId": 456,
      "reportedBy": 789,
      "reportType": "spam",
      "reason": "This listing is spam...",
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "adminNotes": null,
      "actionTaken": null,
      "createdAt": "2025-05-01T10:00:00.000Z",
      "listing": {
        "id": 456,
        "title": "Honda City 2020",
        "slug": "honda-city-2020-abc123"
      },
      "reporter": {
        "id": 789,
        "fullName": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Query Parameters:** `status`, `reportType`, `listingId`, `reportedBy`, `startDate`, `endDate`, `page`, `limit`

---

## 4. Get User Reports

**Method:** GET  
**Endpoint:** `/api/panel/reports/users?status=pending&page=1&limit=20`

**Request:** Query parameters only

**Response:**
```json
{
  "success": true,
  "message": "User reports retrieved successfully",
  "data": [
    {
      "id": 124,
      "reportedUserId": 789,
      "reportedBy": 456,
      "reportType": "scammer",
      "reason": "This user is a known scammer...",
      "context": "Tried to buy a car...",
      "status": "pending",
      "createdAt": "2025-05-01T11:00:00.000Z",
      "reportedUser": {
        "id": 789,
        "fullName": "Scammer User",
        "email": "scammer@example.com",
        "status": "active"
      },
      "reporter": {
        "id": 456,
        "fullName": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ],
  "pagination": {
    "total": 32,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

**Query Parameters:** `status`, `reportType`, `reportedUserId`, `reportedBy`, `startDate`, `endDate`, `page`, `limit`

---

## 5. Get Listing Report by ID

**Method:** GET  
**Endpoint:** `/api/panel/reports/listings/:reportId`

**Request:** URL parameter only

**Response:**
```json
{
  "success": true,
  "message": "Report details retrieved successfully",
  "data": {
    "id": 123,
    "listingId": 456,
    "reportType": "spam",
    "reason": "This listing is spam...",
    "status": "under_review",
    "reviewedBy": 1,
    "reviewedAt": "2025-05-01T12:00:00.000Z",
    "adminNotes": "Investigating the listing",
    "listing": {
      "id": 456,
      "title": "Honda City 2020"
    },
    "reporter": {
      "id": 789,
      "fullName": "John Doe"
    },
    "reviewer": {
      "id": 1,
      "fullName": "Admin User"
    }
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Report not found"
}
```

---

## 6. Get User Report by ID

**Method:** GET  
**Endpoint:** `/api/panel/reports/users/:reportId`

**Request:** URL parameter only

**Response:**
```json
{
  "success": true,
  "message": "Report details retrieved successfully",
  "data": {
    "id": 124,
    "reportedUserId": 789,
    "reportType": "scammer",
    "reason": "This user is a known scammer...",
    "status": "pending",
    "reportedUser": {
      "id": 789,
      "fullName": "Scammer User"
    },
    "reporter": {
      "id": 456,
      "fullName": "Jane Smith"
    }
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Report not found"
}
```

---

## 7. Update Listing Report Status

**Method:** PATCH  
**Endpoint:** `/api/panel/reports/listings/status/:reportId`

**Request:**
```json
{
  "status": "resolved",
  "adminNotes": "Listing has been removed after verification",
  "actionTaken": "listing_removed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report status updated to resolved",
  "data": {
    "reportId": 123,
    "status": "resolved",
    "actionTaken": "listing_removed"
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**Status Values:** `pending`, `under_review`, `resolved`, `dismissed`  
**Action Values:** `none`, `listing_removed`, `listing_edited`, `user_warned`, `user_suspended`, `false_report`

---

## 8. Update User Report Status

**Method:** PATCH  
**Endpoint:** `/api/panel/reports/users/status/:reportId`

**Request:**
```json
{
  "status": "resolved",
  "adminNotes": "User has been suspended after investigation",
  "actionTaken": "user_suspended"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report status updated to resolved",
  "data": {
    "reportId": 124,
    "status": "resolved",
    "actionTaken": "user_suspended"
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Status Values:** `pending`, `under_review`, `resolved`, `dismissed`  
**Action Values:** `none`, `warning_sent`, `user_suspended`, `user_banned`, `listings_removed`, `false_report`

---

## 9. Get Listing Report Statistics

**Method:** GET  
**Endpoint:** `/api/panel/reports/listings/stats`

**Request:** No parameters

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 150,
    "pending": 45,
    "underReview": 12,
    "resolved": 80,
    "dismissed": 13,
    "mostReportedListings": [
      {
        "listingId": 456,
        "reportCount": 8,
        "listing": {
          "id": 456,
          "title": "Honda City 2020"
        }
      }
    ]
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 10. Get User Report Statistics

**Method:** GET  
**Endpoint:** `/api/panel/reports/users/stats`

**Request:** No parameters

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 98,
    "pending": 32,
    "underReview": 8,
    "resolved": 50,
    "dismissed": 8,
    "mostReportedUsers": [
      {
        "reportedUserId": 789,
        "reportCount": 12,
        "reportedUser": {
          "id": 789,
          "fullName": "Scammer User",
          "status": "suspended"
        }
      }
    ]
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

## 11. Get Reports by Listing

**Method:** GET  
**Endpoint:** `/api/panel/reports/listings/by-listing/:listingId?page=1&limit=20`

**Request:** URL parameter + query parameters

**Response:**
```json
{
  "success": true,
  "message": "Listing reports retrieved successfully",
  "data": [
    {
      "id": 123,
      "listingId": 456,
      "reportType": "spam",
      "reason": "This listing is spam...",
      "status": "pending",
      "reporter": {
        "id": 789,
        "fullName": "John Doe"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Listing not found"
}
```

---

## 12. Get Reports by User

**Method:** GET  
**Endpoint:** `/api/panel/reports/users/by-user/:userId?page=1&limit=20`

**Request:** URL parameter + query parameters

**Response:**
```json
{
  "success": true,
  "message": "User reports retrieved successfully",
  "data": [
    {
      "id": 124,
      "reportedUserId": 789,
      "reportType": "scammer",
      "reason": "This user is a known scammer...",
      "status": "pending",
      "reporter": {
        "id": 456,
        "fullName": "Jane Smith"
      }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "User not found"
}
```
