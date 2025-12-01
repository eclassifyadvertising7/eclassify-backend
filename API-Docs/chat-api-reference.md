# Chat System API Reference

Complete API documentation for frontend integration.

**Base URL:** `http://localhost:5000/api`

**Authentication:** All endpoints require JWT token in `Authorization: Bearer <token>` header.

**Standard Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "pagination": { /* optional pagination info */ }
}
```

---

## End-User Chat Endpoints

### Chat Rooms

#### 1. Get User's Chat Rooms

Get all chat rooms for the authenticated user with filters.

**Endpoint:** `GET /end-user/chats/rooms`

**Query Parameters:**
- `main` (string, optional): Filter type - `all`, `buying`, `selling` (default: `all`)
- `sub` (string, optional): Sub-filter - `all`, `unread`, `important`, `elite_buyer`, `elite_seller` (default: `all`)
- `isActive` (boolean, optional): Filter by active status (default: `true`)
- `page` (number, optional): Page number (default: `1`)
- `limit` (number, optional): Items per page (default: `20`)

**Response:**
```json
{
  "success": true,
  "message": "Chat rooms retrieved successfully",
  "data": [
    {
      "id": 123,
      "listingId": 456,
      "buyerId": 789,
      "sellerId": 101,
      "isActive": true,
      "lastMessageAt": "2025-11-30T10:00:00Z",
      "unreadCountBuyer": 3,
      "unreadCountSeller": 0,
      "isImportantBuyer": false,
      "isImportantSeller": false,
      "buyerSubscriptionTier": "basic",
      "sellerSubscriptionTier": "elite",
      "blockedByBuyer": false,
      "blockedBySeller": false,
      "createdAt": "2025-11-29T15:30:00Z",
      "listing": {
        "id": 456,
        "title": "2020 Honda City",
        "price": 500000,
        "status": "active",
        "media": [
          {
            "mediaUrl": "http://localhost:5000/uploads/listings/user-101/images/car-photo.jpg",
            "thumbnailUrl": "http://localhost:5000/uploads/listings/user-101/images/car-photo_thumb.jpg"
          }
        ]
      },
      "buyer": {
        "id": 789,
        "fullName": "John Doe",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/your-cloud/image/upload/eclassify_app/uploads/profiles/user-789/photo.jpg"
        }
      },
      "seller": {
        "id": 101,
        "fullName": "Jane Smith",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/your-cloud/image/upload/eclassify_app/uploads/profiles/user-101/photo.jpg"
        }
      }
    }
  ],
  "pagination": {
    "total": 95,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

#### 2. Create or Get Chat Room

Create a new chat room or get existing one for a listing.

**Endpoint:** `POST /end-user/chats/rooms/create`

**Request Body:**
```json
{
  "listingId": 456
}
```

**Response (New Room):**
```json
{
  "success": true,
  "message": "Chat room created successfully",
  "data": {
    "roomId": 123,
    "isNew": true
  }
}
```

**Response (Existing Room):**
```json
{
  "success": true,
  "message": "Chat room retrieved successfully",
  "data": {
    "roomId": 123,
    "isNew": false
  }
}
```

---

#### 3. View Room Details

Get specific room details without messages.

**Endpoint:** `GET /end-user/chats/rooms/view/:roomId`

**Response:**
```json
{
  "success": true,
  "message": "Chat room retrieved successfully",
  "data": {
    "id": 123,
    "listingId": 456,
    "isActive": true,
    "blockedByBuyer": false,
    "blockedBySeller": false,
    "buyerRequestedContact": false,
    "sellerSharedContact": false,
    "listing": {
      "id": 456,
      "title": "2020 Honda City",
      "price": 500000,
      "status": "active"
    },
    "buyer": {
      "id": 789,
      "fullName": "John Doe"
    },
    "seller": {
      "id": 101,
      "fullName": "Jane Smith"
    }
  }
}
```

---

#### 4. Delete Chat Room

Delete a chat room (cascade deletes messages and offers).

**Endpoint:** `DELETE /end-user/chats/rooms/delete/:roomId`

**Response:**
```json
{
  "success": true,
  "message": "Chat room deleted successfully",
  "data": null
}
```

---

#### 5. Toggle Important Flag

Mark/unmark room as important.

**Endpoint:** `PATCH /end-user/chats/rooms/important/:roomId`

**Request Body:**
```json
{
  "isImportant": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Room marked as important",
  "data": null
}
```

---

#### 6. Block/Unblock User

Block or unblock the other user in the room.

**Endpoint:** `PATCH /end-user/chats/rooms/block/:roomId`

**Request Body:**
```json
{
  "blocked": true,
  "reason": "Spam messages"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": null
}
```

---

#### 7. Report User

Report the other user in the room.

**Endpoint:** `POST /end-user/chats/rooms/report/:roomId`

**Request Body:**
```json
{
  "reportType": "spam",
  "reason": "Sending promotional messages repeatedly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": null
}
```

---

### Messages

#### 8. Send Text Message

Send a text message in a room.

**Endpoint:** `POST /end-user/chats/messages/send/:roomId`

**Request Body:**
```json
{
  "messageType": "text",
  "messageText": "Is this still available?",
  "replyToMessageId": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": 1001,
    "createdAt": "2025-11-30T10:00:00Z"
  }
}
```

---

#### 9. Send Image Message

Send an image message with optional caption.

**Endpoint:** `POST /end-user/chats/messages/send/:roomId`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `messageType`: `"image"`
- `messageText`: `"Here's a photo"` (optional caption)
- `image`: File (max 5MB, jpg/png/webp)

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": 1002,
    "createdAt": "2025-11-30T10:05:00Z"
  }
}
```

---

#### 10. Send Location Message

Send a location message.

**Endpoint:** `POST /end-user/chats/messages/send/:roomId`

**Request Body:**
```json
{
  "messageType": "location",
  "messageText": "Let's meet here",
  "locationData": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "Connaught Place, New Delhi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": 1003,
    "createdAt": "2025-11-30T10:10:00Z"
  }
}
```

---

#### 11. Get Messages

Get paginated messages for a room.

**Endpoint:** `GET /end-user/chats/messages/list/:roomId`

**Query Parameters:**
- `page` (number, optional): Page number (default: `1`)
- `limit` (number, optional): Messages per page (default: `50`)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": 1001,
      "chatRoomId": 123,
      "senderId": 789,
      "messageType": "text",
      "messageText": "Is this still available?",
      "messageMetadata": null,
      "mediaUrl": null,
      "thumbnailUrl": null,
      "replyToMessageId": null,
      "systemEventType": null,
      "isRead": true,
      "readAt": "2025-11-30T10:05:00Z",
      "editedAt": null,
      "createdAt": "2025-11-30T10:00:00Z",
      "sender": {
        "id": 789,
        "fullName": "John Doe",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/your-cloud/image/upload/eclassify_app/uploads/profiles/user-789/photo.jpg"
        }
      },
      "replyToMessage": null
    },
    {
      "id": 1002,
      "chatRoomId": 123,
      "senderId": 789,
      "messageType": "image",
      "messageText": "Here's a photo",
      "messageMetadata": null,
      "mediaUrl": "http://localhost:5000/uploads/chats/room-123/images/2024-11-30-abc123.jpg",
      "thumbnailUrl": "http://localhost:5000/uploads/chats/room-123/images/2024-11-30-abc123_thumb.jpg",
      "mimeType": "image/jpeg",
      "fileSizeBytes": 245678,
      "width": 1920,
      "height": 1080,
      "storageType": "local",
      "isRead": false,
      "createdAt": "2025-11-30T10:05:00Z",
      "sender": {
        "id": 789,
        "fullName": "John Doe"
      }
    },
    {
      "id": 1003,
      "chatRoomId": 123,
      "senderId": 101,
      "messageType": "location",
      "messageText": "Let's meet here",
      "messageMetadata": {
        "lat": 28.6139,
        "lng": 77.2090,
        "address": "Connaught Place, New Delhi"
      },
      "isRead": false,
      "createdAt": "2025-11-30T10:10:00Z",
      "sender": {
        "id": 101,
        "fullName": "Jane Smith"
      }
    },
    {
      "id": 1004,
      "chatRoomId": 123,
      "senderId": null,
      "messageType": "system",
      "messageText": "Buyer made an offer of ₹450,000",
      "systemEventType": "offer_made",
      "messageMetadata": {
        "offerId": 999,
        "amount": 450000
      },
      "isRead": false,
      "createdAt": "2025-11-30T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

---

#### 12. Edit Message

Edit own message (within 15 minutes, no replies).

**Endpoint:** `PATCH /end-user/chats/messages/edit/:messageId`

**Request Body:**
```json
{
  "messageText": "Updated message text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": null
}
```

---

#### 13. Delete Message

Soft delete own message.

**Endpoint:** `DELETE /end-user/chats/messages/delete/:messageId`

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": null
}
```

---

#### 14. Mark Messages as Read

Mark all unread messages in a room as read.

**Endpoint:** `PATCH /end-user/chats/messages/mark-read/:roomId`

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": null
}
```

---

### Offers

#### 15. Create Offer

Make an offer on a listing (buyer only).

**Endpoint:** `POST /end-user/chats/offers/create/:roomId`

**Request Body:**
```json
{
  "amount": 450000,
  "notes": "Cash payment, can pick up tomorrow",
  "expiresAt": "2025-12-07T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Offer submitted successfully",
  "data": {
    "offerId": 999,
    "amount": 450000,
    "status": "pending"
  }
}
```

---

#### 16. Get Offers

Get all offers for a room (negotiation history).

**Endpoint:** `GET /end-user/chats/offers/list/:roomId`

**Response:**
```json
{
  "success": true,
  "message": "Offers retrieved successfully",
  "data": [
    {
      "id": 1,
      "listingId": 456,
      "chatRoomId": 123,
      "buyerId": 789,
      "sellerId": 101,
      "offeredAmount": 450000,
      "listingPriceAtTime": 500000,
      "discountPercentage": 10.0,
      "notes": "Cash payment",
      "parentOfferId": null,
      "status": "countered",
      "expiresAt": "2025-12-07T23:59:59Z",
      "viewedAt": "2025-11-30T10:20:00Z",
      "respondedAt": "2025-11-30T11:00:00Z",
      "createdAt": "2025-11-30T10:00:00Z",
      "buyer": {
        "id": 789,
        "fullName": "John Doe"
      },
      "seller": {
        "id": 101,
        "fullName": "Jane Smith"
      }
    },
    {
      "id": 2,
      "offeredAmount": 480000,
      "discountPercentage": 4.0,
      "status": "accepted",
      "parentOfferId": 1,
      "createdAt": "2025-11-30T11:00:00Z"
    }
  ]
}
```

---

#### 17. Accept Offer

Accept an offer (seller only).

**Endpoint:** `PATCH /end-user/chats/offers/accept/:offerId`

**Response:**
```json
{
  "success": true,
  "message": "Offer accepted successfully",
  "data": null
}
```

---

#### 18. Reject Offer

Reject an offer (seller only).

**Endpoint:** `PATCH /end-user/chats/offers/reject/:offerId`

**Request Body:**
```json
{
  "reason": "Price too low"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Offer rejected",
  "data": null
}
```

---

#### 19. Withdraw Offer

Withdraw pending offer (buyer only).

**Endpoint:** `PATCH /end-user/chats/offers/withdraw/:offerId`

**Response:**
```json
{
  "success": true,
  "message": "Offer withdrawn",
  "data": null
}
```

---

#### 20. Counter Offer

Make a counter offer (seller only).

**Endpoint:** `POST /end-user/chats/offers/counter/:offerId`

**Request Body:**
```json
{
  "amount": 480000,
  "notes": "Best I can do",
  "expiresAt": "2025-12-07T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Counter-offer submitted",
  "data": {
    "offerId": 1000,
    "amount": 480000,
    "status": "pending"
  }
}
```

---

### Contact Sharing

#### 21. Request Contact

Request seller's contact information (buyer only).

**Endpoint:** `POST /end-user/chats/contact/request/:roomId`

**Response:**
```json
{
  "success": true,
  "message": "Contact request sent",
  "data": null
}
```

---

#### 22. Share Contact

Share contact information with buyer (seller only).

**Endpoint:** `POST /end-user/chats/contact/share/:roomId`

**Request Body:**
```json
{
  "phone": "9175113022",
  "email": "seller@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact information shared",
  "data": {
    "phone": "9175113022",
    "email": "seller@example.com"
  }
}
```

---

## Socket.io Events

### Connection

**URL:** `ws://localhost:5000`

**Authentication:**
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

### Client → Server Events

#### join_room
```javascript
socket.emit('join_room', { roomId: 123 });
```

#### leave_room
```javascript
socket.emit('leave_room', { roomId: 123 });
```

#### send_message
```javascript
socket.emit('send_message', {
  roomId: 123,
  messageText: 'Hello',
  replyToMessageId: null
});
```

#### typing
```javascript
socket.emit('typing', { roomId: 123 });
```

#### stop_typing
```javascript
socket.emit('stop_typing', { roomId: 123 });
```

#### mark_read
```javascript
socket.emit('mark_read', { roomId: 123 });
```

---

### Server → Client Events

#### joined_room
```javascript
socket.on('joined_room', (data) => {
  console.log('Joined room:', data.roomId);
});
```

#### new_message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // data = { roomId, message: { id, senderId, messageType, messageText, createdAt } }
});
```

#### message_read
```javascript
socket.on('message_read', (data) => {
  console.log('Messages read:', data);
  // data = { roomId, userId, readAt }
});
```

#### message_deleted
```javascript
socket.on('message_deleted', (data) => {
  console.log('Message deleted:', data);
  // data = { roomId, messageId }
});
```

#### user_typing
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data.userId);
  // data = { roomId, userId }
});
```

#### user_stop_typing
```javascript
socket.on('user_stop_typing', (data) => {
  console.log('User stopped typing:', data.userId);
  // data = { roomId, userId }
});
```

#### room_inactive
```javascript
socket.on('room_inactive', (data) => {
  console.log('Room inactive:', data.reason);
  // data = { roomId, reason }
});
```

#### offer_received
```javascript
socket.on('offer_received', (data) => {
  console.log('New offer:', data);
  // data = { roomId, offerId, amount }
});
```

#### error
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (access denied, not room participant)
- `404` - Not Found (room/message/offer not found)
- `500` - Internal Server Error

**Example Error:**
```json
{
  "success": false,
  "message": "Cannot send messages. Listing is no longer available."
}
```

---

## Notes for Frontend

1. **Authentication:** Include JWT token in all requests: `Authorization: Bearer <token>`

2. **Image Upload:** Use `FormData` for image messages:
   ```javascript
   const formData = new FormData();
   formData.append('messageType', 'image');
   formData.append('messageText', 'Caption here');
   formData.append('image', fileObject);
   ```

3. **Socket.io:** Connect once on app load, join/leave rooms as needed

4. **Typing Indicators:** Throttle typing events (500ms) to reduce server load

5. **Unread Counts:** Update locally when marking as read, refresh from API periodically

6. **Real-time Updates:** Listen to socket events for instant UI updates

7. **Pagination:** Load more messages on scroll (50 per page recommended)

8. **Image URLs:** All image URLs are absolute and ready to use in `<img>` tags

9. **System Messages:** Display differently (no sender, special styling)

10. **Offer Status:** Check `status` field - only `pending` offers can be accepted/rejected/withdrawn

---

**Last Updated:** 2025-11-30  
**API Version:** 1.0
