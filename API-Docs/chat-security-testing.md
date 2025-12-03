# Chat System Security Testing Guide

## Overview

This document provides test scenarios to verify chat room access control security. The system prevents unauthorized access while allowing super_admin spectator mode.

## Security Rules

1. **Regular users (role: 'user')** can ONLY access rooms where they are buyer OR seller
2. **Super admin (role: 'super_admin')** can access ANY room (spectator/read-only mode)
3. All access attempts are validated on both HTTP and Socket.io layers
4. Super admin access is logged for audit trail

---

## Test Scenarios

### 1. Regular User Access Control

#### Test 1.1: User accesses their own room (as buyer)
**Setup:**
- User A (role: user) is buyer in room 1
- User A tries to access room 1

**Expected Result:** ✅ **ALLOW**
- HTTP: 200 OK
- Socket: Successfully joins room
- User can view messages, send messages, make offers

**Test Command:**
```bash
# Get JWT token for User A
TOKEN_A="<user_a_jwt_token>"

# Access room 1
curl -X GET "http://localhost:5000/api/end-user/chats/rooms/view/1" \
  -H "Authorization: Bearer $TOKEN_A"
```

---

#### Test 1.2: User accesses their own room (as seller)
**Setup:**
- User B (role: user) is seller in room 1
- User B tries to access room 1

**Expected Result:** ✅ **ALLOW**
- HTTP: 200 OK
- Socket: Successfully joins room
- User can view messages, send messages, accept/reject offers

---

#### Test 1.3: User tries to access someone else's room
**Setup:**
- User A (role: user) is NOT participant in room 2
- User A tries to access room 2 by changing URL parameter

**Expected Result:** ❌ **DENY (403 Forbidden)**
- HTTP: 403 Forbidden
- Error message: "Access forbidden"
- Socket: Connection rejected with error

**Test Command:**
```bash
# User A tries to access room 2 (not their room)
curl -X GET "http://localhost:5000/api/end-user/chats/rooms/view/2" \
  -H "Authorization: Bearer $TOKEN_A"

# Expected response:
# {
#   "success": false,
#   "message": "Access forbidden",
#   "data": null
# }
```

---

#### Test 1.4: User tries to send message to someone else's room
**Setup:**
- User A tries to send message to room 2 (not their room)

**Expected Result:** ❌ **DENY (403 Forbidden)**

**Test Command:**
```bash
curl -X POST "http://localhost:5000/api/end-user/chats/messages/send/2" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "messageType": "text",
    "messageText": "Trying to hack into this room"
  }'

# Expected: 403 Forbidden
```

---

#### Test 1.5: User tries to view messages from someone else's room
**Setup:**
- User A tries to list messages from room 2

**Expected Result:** ❌ **DENY (403 Forbidden)**

**Test Command:**
```bash
curl -X GET "http://localhost:5000/api/end-user/chats/messages/list/2" \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: 403 Forbidden
```

---

#### Test 1.6: User tries to delete someone else's room
**Setup:**
- User A tries to delete room 2

**Expected Result:** ❌ **DENY (403 Forbidden)**

**Test Command:**
```bash
curl -X DELETE "http://localhost:5000/api/end-user/chats/rooms/delete/2" \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: 403 Forbidden
```

---

### 2. Super Admin Spectator Mode

#### Test 2.1: Super admin views any room
**Setup:**
- Admin (role: super_admin) tries to access room 1 (not their room)

**Expected Result:** ✅ **ALLOW (Spectator Mode)**
- HTTP: 200 OK
- Access is logged: "Super admin {userId} accessing chat room {roomId}"
- Can view room details and messages

**Test Command:**
```bash
# Get JWT token for super admin
TOKEN_ADMIN="<super_admin_jwt_token>"

# Access any room
curl -X GET "http://localhost:5000/api/end-user/chats/rooms/view/1" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Expected: 200 OK with room data
```

---

#### Test 2.2: Super admin joins room via Socket.io
**Setup:**
- Admin connects to Socket.io and joins room 1

**Expected Result:** ✅ **ALLOW (Spectator Mode)**
- Socket: Successfully joins room
- Receives `joined_room` event with `spectatorMode: true`
- Can view messages in real-time
- Logged: "Super admin {userId} joined room {roomId} (spectator mode)"

**Test Code (JavaScript):**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: ADMIN_TOKEN }
});

socket.emit('join_room', { roomId: 1 });

socket.on('joined_room', (data) => {
  console.log('Joined room:', data);
  // Expected: { roomId: 1, spectatorMode: true }
});
```

---

#### Test 2.3: Super admin tries to send message (should fail)
**Setup:**
- Admin tries to send message via Socket.io

**Expected Result:** ❌ **DENY**
- Socket: Error emitted
- Error message: "Super admin cannot send messages in spectator mode"

**Test Code:**
```javascript
socket.emit('send_message', {
  roomId: 1,
  messageText: 'Admin trying to send message'
});

socket.on('error', (error) => {
  console.log('Error:', error.message);
  // Expected: "Super admin cannot send messages in spectator mode"
});
```

---

#### Test 2.4: Super admin tries to emit typing indicator (should be ignored)
**Setup:**
- Admin emits typing event

**Expected Result:** ✅ **SILENTLY IGNORED**
- No error thrown
- No typing indicator sent to other users
- Admin cannot interact in spectator mode

---

#### Test 2.5: Super admin tries to toggle important flag (should fail)
**Setup:**
- Admin tries to mark room as important

**Expected Result:** ❌ **DENY**
- HTTP: 400 Bad Request
- Error message: "Super admin cannot modify room settings"

**Test Command:**
```bash
curl -X PATCH "http://localhost:5000/api/end-user/chats/rooms/important/1" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{ "isImportant": true }'

# Expected: 400 Bad Request
```

---

#### Test 2.6: Super admin tries to block user (should fail)
**Setup:**
- Admin tries to block a user in the room

**Expected Result:** ❌ **DENY**
- HTTP: 400 Bad Request
- Error message: "Super admin cannot block users in spectator mode"

---

#### Test 2.7: Super admin tries to report user (should fail)
**Setup:**
- Admin tries to report a user

**Expected Result:** ❌ **DENY**
- HTTP: 400 Bad Request
- Error message: "Super admin cannot report users in spectator mode"

---

#### Test 2.8: Super admin deletes room (moderation action)
**Setup:**
- Admin deletes room 1 for moderation purposes

**Expected Result:** ✅ **ALLOW**
- HTTP: 200 OK
- Room is deleted
- This is a moderation action, not spectator mode

**Test Command:**
```bash
curl -X DELETE "http://localhost:5000/api/end-user/chats/rooms/delete/1" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Expected: 200 OK
```

---

### 3. Unauthenticated Access

#### Test 3.1: No JWT token provided
**Setup:**
- Request without Authorization header

**Expected Result:** ❌ **DENY (401 Unauthorized)**

**Test Command:**
```bash
curl -X GET "http://localhost:5000/api/end-user/chats/rooms/view/1"

# Expected: 401 Unauthorized
```

---

#### Test 3.2: Invalid JWT token
**Setup:**
- Request with malformed or expired token

**Expected Result:** ❌ **DENY (401 Unauthorized)**

**Test Command:**
```bash
curl -X GET "http://localhost:5000/api/end-user/chats/rooms/view/1" \
  -H "Authorization: Bearer invalid_token_here"

# Expected: 401 Unauthorized
```

---

### 4. Edge Cases

#### Test 4.1: Room does not exist
**Setup:**
- User tries to access non-existent room 9999

**Expected Result:** ❌ **DENY (404 Not Found)**

**Test Command:**
```bash
curl -X GET "http://localhost:5000/api/end-user/chats/rooms/view/9999" \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: 404 Not Found
```

---

#### Test 4.2: Invalid room ID format
**Setup:**
- User provides non-numeric room ID

**Expected Result:** ❌ **DENY (400 Bad Request)**

**Test Command:**
```bash
curl -X GET "http://localhost:5000/api/end-user/chats/rooms/view/abc" \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: 400 Bad Request
```

---

#### Test 4.3: User leaves room then tries to rejoin
**Setup:**
- User A is in room 1
- User A deletes the room
- User A tries to access room 1 again

**Expected Result:** ❌ **DENY (404 Not Found)**
- Room no longer exists

---

## Audit Logging Verification

### Check Logs for Super Admin Access

**Expected Log Entries:**
```
[INFO] Super admin 5 accessing chat room 1
[INFO] Super admin 5 joined room 1 (spectator mode)
```

**Verify Logs:**
```bash
# Check application logs
tail -f logs/app.log | grep "Super admin"
```

---

## Security Checklist

- [ ] Regular users cannot access rooms they don't participate in
- [ ] Super admin can view any room (spectator mode)
- [ ] Super admin cannot send messages
- [ ] Super admin cannot modify room settings
- [ ] Super admin cannot block/report users
- [ ] Super admin access is logged
- [ ] Unauthenticated requests are rejected
- [ ] Invalid tokens are rejected
- [ ] Non-existent rooms return 404
- [ ] Socket.io connections validate access
- [ ] Socket.io prevents super admin from sending messages
- [ ] All endpoints use `validateRoomAccess` middleware
- [ ] Message endpoints use `validateMessageAccess` middleware

---

## Automated Testing Script

```bash
#!/bin/bash

# Chat Security Test Suite

echo "=== Chat Room Access Control Tests ==="

# Set tokens (replace with actual tokens)
TOKEN_USER_A="<user_a_token>"
TOKEN_USER_B="<user_b_token>"
TOKEN_ADMIN="<admin_token>"
BASE_URL="http://localhost:5000/api/end-user/chats"

# Test 1: User A accesses their own room (should succeed)
echo "Test 1: User A accesses own room..."
curl -s -X GET "$BASE_URL/rooms/view/1" \
  -H "Authorization: Bearer $TOKEN_USER_A" | jq '.success'

# Test 2: User A tries to access User B's room (should fail)
echo "Test 2: User A tries to access other room..."
curl -s -X GET "$BASE_URL/rooms/view/2" \
  -H "Authorization: Bearer $TOKEN_USER_A" | jq '.success'

# Test 3: Super admin accesses any room (should succeed)
echo "Test 3: Super admin accesses any room..."
curl -s -X GET "$BASE_URL/rooms/view/1" \
  -H "Authorization: Bearer $TOKEN_ADMIN" | jq '.success'

# Test 4: Unauthenticated access (should fail)
echo "Test 4: Unauthenticated access..."
curl -s -X GET "$BASE_URL/rooms/view/1" | jq '.success'

echo "=== Tests Complete ==="
```

---

## Frontend Integration Notes

### Frontend Route Guard

The frontend should also implement route guards, but **backend validation is the primary security layer**.

**Example React Route Guard:**
```javascript
// This is a UX enhancement, not security
const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  
  // Backend will enforce access control
  // This is just for better UX
  useEffect(() => {
    // Fetch room details
    // If 403, redirect to chat list
  }, [roomId]);
  
  return <ChatRoomUI roomId={roomId} />;
};
```

### Handling 403 Errors

```javascript
// When user tries to access unauthorized room
axios.get(`/api/end-user/chats/rooms/view/${roomId}`)
  .then(response => {
    // Show chat room
  })
  .catch(error => {
    if (error.response?.status === 403) {
      // Redirect to chat list
      navigate('/chats');
      toast.error('You do not have access to this chat room');
    }
  });
```

---

## Conclusion

The chat system implements robust access control at multiple layers:
1. **Middleware validation** on all HTTP endpoints
2. **Socket.io authentication** on connection and events
3. **Service layer checks** for business logic
4. **Audit logging** for super admin access

This ensures users cannot access unauthorized chat rooms by manipulating URL parameters or API calls.
