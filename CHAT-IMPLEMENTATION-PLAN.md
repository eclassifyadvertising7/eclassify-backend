# Chat System Implementation Plan

## Overview
Implementation of real-time chat system for buyers and sellers with offer negotiation, contact sharing, blocking, and reporting features.

## Completed
- ✅ Database migrations (3 tables: chat_rooms, chat_messages, listing_offers)
- ✅ Sequelize models (ChatRoom, ChatMessage, ListingOffer)
- ✅ Model associations and hooks
- ✅ DATABASE-SCHEMA.md updated

## Implementation Tasks

### Task 1: Repositories (3 files)
**Location:** `src/repositories/`

**Files to create:**
1. `chatRoomRepository.js`
   - CRUD operations for chat rooms
   - Filter queries (all, buying, selling, unread, important, elite)
   - Blocking and reporting operations
   - Update unread counts, last message timestamp

2. `chatMessageRepository.js`
   - CRUD operations for messages
   - Pagination queries
   - Mark messages as read
   - Get unread count
   - Soft delete support

3. `listingOfferRepository.js`
   - CRUD operations for offers
   - Status updates (accept, reject, withdraw, expire)
   - Get negotiation chain (parent-child offers)
   - Get offers by listing/room/user

**Dependencies:** Models (ChatRoom, ChatMessage, ListingOffer)

---

### Task 2: Services (3 files)
**Location:** `src/services/`

**Files to create:**
1. `chatRoomService.js`
   - Create or get existing room
   - Get rooms with filters (main + sub filters)
   - Toggle important flag
   - Block/unblock user
   - Report user/room
   - Request/share contact information
   - Validate room access (buyer or seller only)

2. `chatMessageService.js`
   - Send text message
   - Send image message (reuse existing upload system)
   - Send location message
   - Send system message (offers, contact sharing, etc.)
   - Edit message (within 15 min, no replies)
   - Delete message (soft delete)
   - Mark messages as read
   - Validate message permissions

3. `listingOfferService.js`
   - Create offer (buyer)
   - Accept offer (seller)
   - Reject offer (seller)
   - Counter offer (seller)
   - Withdraw offer (buyer)
   - Expire offers (cron job)
   - Get offer history
   - Validate offer permissions

**Dependencies:** Repositories, storageConfig, imageService, uploadFile, deleteFile

---

### Task 3: Upload System Extension (2 files)
**Location:** `src/config/` and `src/middleware/`

**Files to update:**
1. `src/config/uploadConfig.js`
   - Add `CHAT_IMAGE` configuration:
     ```javascript
     CHAT_IMAGE: {
       maxSize: 5 * 1024 * 1024, // 5MB
       allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
       allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
       maxWidth: 1920,
       maxHeight: 1080,
       thumbnailSize: 300,
       quality: 85
     }
     ```

2. `src/middleware/uploadMiddleware.js`
   - Add `uploadChatImage` middleware:
     ```javascript
     export const uploadChatImage = multer({
       storage: createStorage('chats', 'images'),
       limits: { fileSize: UPLOAD_CONFIG.CHAT_IMAGE.maxSize },
       fileFilter: createFileFilter(UPLOAD_CONFIG.CHAT_IMAGE.allowedTypes)
     }).single('image');
     ```
   - Update `createStorage` to handle `chats` type:
     - Path: `uploads/chats/room-{roomId}/images/`
     - Get roomId from `req.params.roomId`

**Dependencies:** Existing upload system

**Folder Structure:**
```
uploads/
└── chats/
    ├── room-123/
    │   └── images/
    │       ├── 2024-11-30-abc123.jpg
    │       └── thumb_2024-11-30-abc123.jpg
    └── room-456/
        └── images/
```

**Cloudinary Path:** `eclassify_app/uploads/chats/room-{id}/images/{filename}`
**Database Path:** `uploads/chats/room-{id}/images/{filename}` (same for local and Cloudinary)

---

### Task 4: End-User Controllers (3 files)
**Location:** `src/controllers/end-user/`

**Files to create:**
1. `chatRoomController.js`
   - `getRooms` - GET /rooms (with filters)
   - `createRoom` - POST /rooms/create
   - `viewRoom` - GET /rooms/view/:roomId
   - `deleteRoom` - DELETE /rooms/delete/:roomId
   - `toggleImportant` - PATCH /rooms/important/:roomId
   - `blockUser` - PATCH /rooms/block/:roomId
   - `reportUser` - POST /rooms/report/:roomId

2. `chatMessageController.js`
   - `sendMessage` - POST /messages/send/:roomId (text/image/location)
   - `getMessages` - GET /messages/list/:roomId (paginated)
   - `editMessage` - PATCH /messages/edit/:messageId
   - `deleteMessage` - DELETE /messages/delete/:messageId
   - `markAsRead` - PATCH /messages/mark-read/:roomId

3. `chatOfferController.js`
   - `createOffer` - POST /offers/create/:roomId
   - `getOffers` - GET /offers/list/:roomId
   - `acceptOffer` - PATCH /offers/accept/:offerId
   - `rejectOffer` - PATCH /offers/reject/:offerId
   - `withdrawOffer` - PATCH /offers/withdraw/:offerId
   - `counterOffer` - POST /offers/counter/:offerId
   - `requestContact` - POST /contact/request/:roomId
   - `shareContact` - POST /contact/share/:roomId

**Dependencies:** Services, authMiddleware, uploadChatImage

---

### Task 5: Panel Controller (1 file)
**Location:** `src/controllers/panel/`

**Files to create:**
1. `chatManagementController.js`
   - `getRooms` - GET /rooms/list (with filters: reported, blocked, hasOffers)
   - `viewRoom` - GET /rooms/view/:roomId (full details)
   - `deleteRoom` - DELETE /rooms/delete/:roomId (hard delete)
   - `deleteMessage` - DELETE /messages/delete/:messageId (hard delete)
   - `getReports` - GET /reports/list (with status filter)
   - `resolveReport` - PATCH /reports/resolve/:roomId
   - `getStats` - GET /analytics/stats
   - `getTopListings` - GET /analytics/offers/top-listings
   - `getOfferTrends` - GET /analytics/offers/trends
   - `getAcceptanceRate` - GET /analytics/offers/acceptance-rate

**Dependencies:** Services, authMiddleware, roleMiddleware (super_admin only)

---

### Task 6: Routes (2 files)
**Location:** `src/routes/end-user/` and `src/routes/panel/`

**Files to create:**
1. `src/routes/end-user/chatRoutes.js`
   - Mount all end-user chat endpoints
   - Apply authMiddleware to all routes
   - Apply uploadChatImage to image upload endpoint
   - Base path: `/api/end-user/chats`

2. `src/routes/panel/chatRoutes.js`
   - Mount all panel chat endpoints
   - Apply authMiddleware + roleMiddleware (super_admin)
   - Base path: `/api/panel/chats`

**Dependencies:** Controllers, middleware

---

### Task 7: Socket.io Setup (2 files)
**Location:** `src/socket/`

**Files to create/update:**
1. `chatHandler.js` (new)
   - Handle socket events:
     - `join_room` - Join chat room
     - `leave_room` - Leave chat room
     - `send_message` - Send message via socket
     - `typing` - User typing indicator
     - `stop_typing` - Stop typing
     - `mark_read` - Mark messages as read
   - Emit events:
     - `new_message` - New message received
     - `message_read` - Messages marked as read
     - `message_deleted` - Message deleted
     - `user_typing` - User is typing
     - `user_stop_typing` - User stopped typing
     - `room_inactive` - Room became inactive
     - `offer_received` - New offer received

2. `index.js` (update)
   - Import and register chatHandler
   - Initialize Socket.io if not already done

**Dependencies:** Services, Socket.io

---

### Task 8: Cron Jobs (1 file)
**Location:** `src/jobs/`

**Files to create:**
1. `chatJobs.js`
   - `expirePendingOffers` - Run every hour
     - Find offers with status='pending' and expires_at < NOW()
     - Update status to 'expired', set auto_rejected=true
     - Create system message in chat room
   
   - `deactivateExpiredListingRooms` - Run daily at 2 AM
     - Find listings with status='expired' or deleted_at IS NOT NULL
     - Update chat_rooms.is_active = false for those listings
     - Emit socket event 'room_inactive' to connected users

**Dependencies:** Repositories, node-cron

---

### Task 9: Integration (2 files)
**Location:** `src/`

**Files to update:**
1. `src/app.js`
   - Import chat routes
   - Mount routes:
     ```javascript
     import endUserChatRoutes from './routes/end-user/chatRoutes.js';
     import panelChatRoutes from './routes/panel/chatRoutes.js';
     
     app.use('/api/end-user/chats', endUserChatRoutes);
     app.use('/api/panel/chats', panelChatRoutes);
     ```

2. `src/server.js` (if Socket.io not initialized)
   - Initialize Socket.io
   - Import and setup socket handlers

**Dependencies:** All previous tasks

---

## File Count Summary
- **Repositories:** 3 files
- **Services:** 3 files
- **Upload System:** 2 files (updates)
- **End-User Controllers:** 3 files
- **Panel Controllers:** 1 file
- **Routes:** 2 files
- **Socket.io:** 2 files (1 new, 1 update)
- **Cron Jobs:** 1 file
- **Integration:** 2 files (updates)

**Total:** ~19 files (14 new, 5 updates)

---

## Implementation Order
1. **Task 1** - Repositories (foundation)
2. **Task 3** - Upload System Extension (needed for services)
3. **Task 2** - Services (business logic)
4. **Task 4** - End-User Controllers
5. **Task 5** - Panel Controller
6. **Task 6** - Routes
7. **Task 7** - Socket.io Setup
8. **Task 8** - Cron Jobs
9. **Task 9** - Integration

---

## Testing Checklist
- [ ] Create chat room for listing
- [ ] Send text message
- [ ] Send image message (local storage)
- [ ] Send image message (Cloudinary)
- [ ] Send location message
- [ ] Make offer
- [ ] Accept/reject/counter offer
- [ ] Request/share contact
- [ ] Block/unblock user
- [ ] Report user
- [ ] Mark messages as read
- [ ] Edit message (within 15 min)
- [ ] Delete message
- [ ] Filter rooms (all, buying, selling, unread, important, elite)
- [ ] Socket.io real-time messaging
- [ ] Typing indicators
- [ ] Cron job: Expire offers
- [ ] Cron job: Deactivate rooms
- [ ] Panel: View all rooms
- [ ] Panel: View reports
- [ ] Panel: Analytics

---

## Environment Variables
No new environment variables needed. Uses existing:
- `STORAGE_TYPE` - local/cloudinary
- `UPLOAD_URL` - Base URL for uploads
- `CLOUDINARY_*` - Cloudinary credentials

---

## Notes
- Reuses existing upload system (storageConfig, imageService, storageHelper)
- Follows same pattern as ListingMedia for image storage
- All paths stored without extension in database
- Model getters transform to full URLs with extension
- Socket.io for real-time features
- Cron jobs for automated tasks
- Soft delete for messages (paranoid: true)
- Hard delete for rooms (cascade to messages and offers)

---

**Status:** Ready for implementation
**Last Updated:** 2025-11-30
