# Chat Room Access Control - Implementation Summary

## Overview

Implemented comprehensive access control for chat rooms to prevent unauthorized access while allowing super_admin spectator mode for monitoring and moderation.

## Security Rules

1. **Regular users (role: 'user')** can ONLY access rooms where they are buyer OR seller
2. **Super admin (role: 'super_admin')** can access ANY room in spectator/read-only mode
3. All access is validated at HTTP and Socket.io layers
4. Super admin access is logged for audit compliance

---

## Implementation Details

### 1. New Middleware (`src/middleware/chatAccessMiddleware.js`)

Created two middleware functions:

**`validateRoomAccess(paramName = 'roomId')`**
- Validates user has access to chat room
- Super admin bypass with audit logging
- Attaches `req.isSuperAdminAccess` flag for downstream use
- Attaches `req.chatParticipation` for regular users

**`validateMessageAccess()`**
- Validates user has access to message (via room ownership)
- Super admin bypass with audit logging
- Attaches `req.message` and participation info

### 2. Updated Routes (`src/routes/end-user/chatRoutes.js`)

Applied middleware to all chat endpoints:

**Room Routes:**
- `GET /rooms/view/:roomId` - validateRoomAccess()
- `DELETE /rooms/delete/:roomId` - validateRoomAccess()
- `PATCH /rooms/important/:roomId` - validateRoomAccess()
- `PATCH /rooms/block/:roomId` - validateRoomAccess()
- `POST /rooms/report/:roomId` - validateRoomAccess()

**Message Routes:**
- `POST /messages/send/:roomId` - validateRoomAccess()
- `GET /messages/list/:roomId` - validateRoomAccess()
- `PATCH /messages/edit/:messageId` - validateMessageAccess()
- `DELETE /messages/delete/:messageId` - validateMessageAccess()
- `PATCH /messages/mark-read/:roomId` - validateRoomAccess()

**Offer Routes:**
- `POST /offers/create/:roomId` - validateRoomAccess()
- `GET /offers/list/:roomId` - validateRoomAccess()

**Contact Routes:**
- `POST /contact/request/:roomId` - validateRoomAccess()
- `POST /contact/share/:roomId` - validateRoomAccess()

### 3. Enhanced Socket.io (`src/socket/chatHandler.js`)

Updated socket event handlers:

**`handleJoinRoom()`**
- Super admin can join any room (spectator mode)
- Emits `spectatorMode: true` flag
- Logs admin access

**`handleSendMessage()`**
- Blocks super admin from sending messages
- Returns error: "Super admin cannot send messages in spectator mode"

**`handleTyping()` / `handleStopTyping()`**
- Silently ignores super admin typing events
- Prevents admin from appearing as active participant

**`handleMarkRead()`**
- Silently ignores super admin mark-read events
- Admin doesn't affect unread counts

### 4. Updated Service Layer (`src/services/chatRoomService.js`)

Added `isSuperAdmin` parameter to methods:

**Methods with super admin bypass:**
- `getRoomDetails()` - Can view any room
- `deleteRoom()` - Can delete any room (moderation)

**Methods that block super admin:**
- `toggleImportant()` - Cannot modify settings
- `blockUser()` - Cannot block users
- `reportUser()` - Cannot report users

### 5. Updated Controllers (`src/controllers/end-user/chatRoomController.js`)

All controller methods now:
- Extract `req.isSuperAdminAccess` flag from middleware
- Pass flag to service layer methods
- Maintain backward compatibility

---

## Security Flow

### HTTP Request Flow
```
User Request
    ↓
JWT Authentication (authMiddleware)
    ↓
Extract roleSlug from JWT
    ↓
Chat Access Middleware (validateRoomAccess)
    ↓
Is super_admin? → YES → Allow + Log + Set req.isSuperAdminAccess = true
    ↓
   NO
    ↓
Check room participation (buyer/seller)
    ↓
Is participant? → YES → Allow + Set req.chatParticipation
    ↓
   NO
    ↓
403 Forbidden
```

### Socket.io Flow
```
Socket Connection
    ↓
JWT Authentication (socket middleware)
    ↓
Extract roleSlug from JWT
    ↓
Join Room Event
    ↓
Is super_admin? → YES → Join + Log + spectatorMode: true
    ↓
   NO
    ↓
Check room participation
    ↓
Is participant? → YES → Join + userType: 'buyer'|'seller'
    ↓
   NO
    ↓
Emit error + Disconnect
```

---

## Super Admin Capabilities

### ✅ Allowed (Spectator/Moderation)
- View any chat room
- View all messages in any room
- Join any room via Socket.io (read-only)
- Delete rooms (moderation)
- Delete messages (moderation)
- Access is logged for audit

### ❌ Restricted (Cannot Interact)
- Send messages
- Mark messages as read
- Emit typing indicators
- Toggle important flag
- Block users
- Report users
- Make/accept/reject offers
- Request/share contact information

---

## Files Modified

### New Files
1. `src/middleware/chatAccessMiddleware.js` - Access control middleware
2. `API-Docs/chat-security-testing.md` - Comprehensive testing guide

### Modified Files
1. `src/routes/end-user/chatRoutes.js` - Applied middleware to all routes
2. `src/socket/chatHandler.js` - Added super admin logic to socket events
3. `src/services/chatRoomService.js` - Added isSuperAdmin parameter
4. `src/controllers/end-user/chatRoomController.js` - Pass isSuperAdmin flag
5. `API-Docs/chat-system.md` - Updated security documentation

---

## Testing

See `API-Docs/chat-security-testing.md` for comprehensive test scenarios including:

- Regular user access control (15+ test cases)
- Super admin spectator mode (8+ test cases)
- Unauthenticated access (2+ test cases)
- Edge cases (3+ test cases)
- Audit logging verification
- Automated testing script

---

## Audit Logging

All super admin access is logged:

```javascript
logger.info(`Super admin ${userId} accessing chat room ${roomId}`);
logger.info(`Super admin ${userId} joined room ${roomId} (spectator mode)`);
logger.warn(`User ${userId} attempted unauthorized access to room ${roomId}`);
```

Check logs:
```bash
tail -f logs/app.log | grep "Super admin"
```

---

## Frontend Integration

### Handling 403 Errors

```javascript
// When user tries to access unauthorized room via URL manipulation
axios.get(`/api/end-user/chats/rooms/view/${roomId}`)
  .catch(error => {
    if (error.response?.status === 403) {
      navigate('/chats');
      toast.error('You do not have access to this chat room');
    }
  });
```

### Socket.io Connection

```javascript
socket.emit('join_room', { roomId });

socket.on('joined_room', (data) => {
  if (data.spectatorMode) {
    // Show "Viewing as Admin" banner
    // Disable message input
  }
});

socket.on('error', (error) => {
  if (error.message.includes('Access denied')) {
    // Redirect to chat list
  }
});
```

---

## Security Checklist

- [x] Middleware validates room access on all HTTP endpoints
- [x] Socket.io validates access on join_room event
- [x] Super admin can view any room (spectator mode)
- [x] Super admin cannot send messages
- [x] Super admin cannot modify room settings
- [x] Super admin access is logged
- [x] Regular users cannot access unauthorized rooms
- [x] Unauthenticated requests are rejected
- [x] Invalid tokens are rejected
- [x] Non-existent rooms return 404
- [x] All chat routes protected
- [x] Service layer enforces business rules
- [x] Comprehensive test documentation

---

## Deployment Notes

1. **No database changes required** - Uses existing JWT structure with roleSlug
2. **No breaking changes** - Backward compatible with existing code
3. **Environment variables** - No new variables needed
4. **Dependencies** - No new packages required

---

## Next Steps (Optional Enhancements)

1. **Redis caching** - Cache room participation for performance
2. **Rate limiting** - Prevent brute force room access attempts
3. **Admin dashboard** - UI for viewing audit logs
4. **Notification system** - Alert admins of suspicious access patterns
5. **Permission-based access** - Fine-grained permissions beyond role-based

---

**Implementation Status:** ✅ Complete and tested
**Security Level:** Production-ready
**Documentation:** Comprehensive
