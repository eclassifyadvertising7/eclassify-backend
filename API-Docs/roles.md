# Role Management API

## Overview

Super admin can manage roles in the system. Roles define user permissions and access levels.

## Authentication

All endpoints require:
- Valid JWT token
- Super admin role

## Endpoints

### 1. Get All Roles

Get list of all roles in the system.

**Endpoint:** `GET /api/panel/roles`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

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
        "description": "Full system access",
        "priority": 100,
        "isSystemRole": true,
        "isActive": true
      },
      {
        "id": 2,
        "name": "Admin",
        "slug": "admin",
        "description": "Approve listings, manage users",
        "priority": 90,
        "isSystemRole": true,
        "isActive": true
      },
      {
        "id": 3,
        "name": "User",
        "slug": "user",
        "description": "External users (buyers/sellers)",
        "priority": 10,
        "isSystemRole": true,
        "isActive": true
      }
    ]
  }
}
```

---

### 2. Get Role by ID

Get detailed information about a specific role.

**Endpoint:** `GET /api/panel/roles/:roleId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "role": {
      "id": 2,
      "name": "Admin",
      "slug": "admin",
      "description": "Approve listings, manage users",
      "priority": 90,
      "isSystemRole": true,
      "isActive": true,
      "updatedBy": [
        {
          "userId": 1,
          "userName": "admin@example.com",
          "timestamp": "2025-12-26T10:30:00Z"
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Role not found

---

### 3. Create Role

Create a new role in the system.

**Endpoint:** `POST /api/panel/roles`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Content Manager",
  "slug": "content_manager",
  "description": "Manage content and listings",
  "priority": 50,
  "isActive": true
}
```

**Request Fields:**
- `name` (required): Role display name
- `slug` (required): Unique role identifier (lowercase, underscore separated)
- `description` (optional): Role description
- `priority` (optional): Role priority (higher = more important, default: 0)
- `isActive` (optional): Role status (default: true)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "role": {
      "id": 7,
      "name": "Content Manager",
      "slug": "content_manager",
      "description": "Manage content and listings",
      "priority": 50,
      "isSystemRole": false,
      "isActive": true,
      "createdAt": "2025-12-26T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or validation errors
- `409 Conflict`: Role with slug or name already exists

---

### 4. Update Role

Update an existing role.

**Endpoint:** `PUT /api/panel/roles/:roleId`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Content Manager",
  "description": "Manage content, listings, and categories",
  "priority": 60
}
```

**Request Fields:**
- `name` (optional): Role display name
- `slug` (optional): Role slug
- `description` (optional): Role description
- `priority` (optional): Role priority

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "role": {
      "id": 7,
      "name": "Content Manager",
      "slug": "content_manager",
      "description": "Manage content, listings, and categories",
      "priority": 60,
      "isSystemRole": false,
      "isActive": true,
      "updatedAt": "2025-12-26T11:00:00Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: System roles cannot be modified
- `404 Not Found`: Role not found
- `409 Conflict`: Role with slug or name already exists

---

### 5. Toggle Role Status

Activate or deactivate a role.

**Endpoint:** `PATCH /api/panel/roles/status/:roleId`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Request Fields:**
- `isActive` (required): Boolean - true to activate, false to deactivate

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Role deactivated successfully",
  "data": {
    "role": {
      "id": 7,
      "name": "Content Manager",
      "slug": "content_manager",
      "isActive": false,
      "updatedAt": "2025-12-26T11:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: System roles cannot be deactivated
- `404 Not Found`: Role not found

---

### 6. Get Users by Role

Get all users assigned to a specific role.

**Endpoint:** `GET /api/panel/roles/users/:roleId?page=1&limit=20&search=john&status=active`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

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
        "mobile": "9175113022",
        "email": "john@example.com",
        "isActive": true,
        "status": "active",
        "createdAt": "2025-12-01T10:00:00Z",
        "role": {
          "id": 3,
          "name": "User",
          "slug": "user"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Role not found

---

## Role Types

### System Roles
System roles are predefined and cannot be deleted or have their core properties modified:
- `super_admin`: Full system access
- `admin`: Approve listings, manage users
- `accountant`: Financial management
- `marketing`: Feature listings, promotions
- `seo`: Content optimization
- `user`: External users (buyers/sellers)

### Custom Roles
Custom roles can be created, modified, and deactivated by super admin.

---

## Role Priority

Priority determines role hierarchy (higher = more important):
- `super_admin`: 100
- `admin`: 90
- `accountant`: 70
- `marketing`: 60
- `seo`: 50
- `user`: 10
- Custom roles: 0-100 (configurable)

---

## Validation Rules

### Role Name
- Required
- Must be unique
- 2-50 characters

### Role Slug
- Required
- Must be unique
- Lowercase letters, numbers, and underscores only
- 2-50 characters

### Priority
- Integer between 0-100
- Default: 0

---

## Notes

- System roles (`isSystemRole: true`) cannot be deleted or deactivated
- Deactivating a role does not affect existing users with that role
- Users with deactivated roles can still log in but may have restricted access
- Role slug is used in code for permission checks
- Role name is displayed in UI
- `updatedBy` field tracks all updates with user info and timestamp
