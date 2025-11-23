# Project Structure & Architecture

## Important Notes

**Ignore `old_project/` folder** - This is reference material only and should not be considered part of the active codebase.

## Folder Organization

```
backend/
├── src/
│   ├── config/          # Database, passport, storage config
│   ├── controllers/     # Request handlers (classes with static methods)
│   │   ├── auth/        # Authentication controllers (signup, login, logout)
│   │   ├── panel/       # Admin/staff panel controllers (all roles)
│   │   ├── end-user/    # End-user controllers (profile, listings, etc.)
│   │   └── public/      # Public API controllers (no auth required)
│   ├── services/        # Business logic (singleton classes) - FLAT, NO SUBDIRECTORIES
│   ├── repositories/    # Database operations (singleton classes) - FLAT, NO SUBDIRECTORIES
│   ├── models/          # Sequelize models
│   ├── middleware/      # Auth, validation, error handling - FLAT, NO SUBDIRECTORIES
│   ├── routes/          # API routes
│   │   ├── auth/        # Authentication routes
│   │   ├── panel/       # Admin/staff panel routes
│   │   ├── end-user/    # End-user routes
│   │   └── public/      # Public routes
│   ├── utils/           # Helpers, formatters, constants - FLAT, NO SUBDIRECTORIES
│   ├── uploads/         # Upload config and middleware
│   ├── socket/          # Socket.io handlers
│   ├── jobs/            # Cron jobs
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── migrations/          # Database migrations
├── seeders/             # Database seeders
├── tests/               # Unit and integration tests
└── package.json
```

## Subdirectory Organization Guidelines

### CRITICAL: Subdirectories ONLY for Controllers and Routes

**Subdirectories are used ONLY in:**
- `src/controllers/` - Organized by access level (auth, common, panel, end-user, public)
- `src/routes/` - Organized by access level (auth, common, panel, end-user, public)

**All other folders remain FLAT (no subdirectories):**
- `src/services/` - All service files in root
- `src/repositories/` - All repository files in root
- `src/middleware/` - All middleware files in root
- `src/utils/` - All utility files in root (except constants/ subfolder)

### Controller & Route Subdirectories

#### 1. `auth/` - Authentication
**Purpose**: User authentication, token management, session handling

**Examples:**
- `controllers/auth/authController.js` - Signup, login, logout, refresh token
- `routes/auth/authRoutes.js` - Auth endpoints

**Access**: Public (no authentication required)
**API Path**: `/api/auth/*`

#### 2. `common/` - Shared Resources
**Purpose**: Resources accessible to multiple user types (end-users and admins)

**Examples:**
- `controllers/common/profileController.js` - Profile management for all users
- `controllers/common/locationController.js` - States/cities lookup
- `routes/common/profileRoutes.js` - Profile endpoints
- `routes/common/locationRoutes.js` - Location endpoints

**Access**: Mixed (some public, some require authentication, some admin-only)
**API Paths**: 
- `/api/profile/*` - Profile operations
- `/api/common/*` - Public utilities (states, cities)

#### 3. `panel/` - Admin/Staff Panels
**Purpose**: All admin and staff operations (super_admin, admin, marketing, seo, accountant, sales)

**Examples:**
- `controllers/panel/categoryController.js` - Category management
- `controllers/panel/userManagementController.js` - User management
- `controllers/panel/dashboardController.js` - Statistics and analytics
- `controllers/panel/promotionController.js` - Marketing features
- `controllers/panel/seoController.js` - SEO management
- `routes/panel/categoryRoutes.js` - Category routes
- `routes/panel/dashboardRoutes.js` - Dashboard routes

**Access**: Requires authentication + specific role permissions
**API Path**: `/api/panel/*`

#### 3. `end-user/` - End-User Operations
**Purpose**: End-user's own resources and operations

**Examples:**
- `controllers/end-user/profileController.js` - User's own profile
- `controllers/end-user/listingController.js` - User's own listings
- `controllers/end-user/subscriptionController.js` - User's subscriptions
- `routes/end-user/profileRoutes.js` - Profile routes
- `routes/end-user/listingRoutes.js` - User listing routes

**Access**: Requires authentication (user role)
**API Path**: `/api/end-user/*`

#### 5. `public/` - Public APIs
**Purpose**: Publicly accessible endpoints (no authentication required)

**Examples:**
- `controllers/public/listingController.js` - Browse all listings
- `controllers/public/categoryController.js` - Get categories
- `controllers/public/searchController.js` - Search functionality
- `routes/public/listingRoutes.js` - Public listing endpoints
- `routes/public/searchRoutes.js` - Search endpoints

**Access**: Public (no authentication required)
**API Path**: `/api/public/*`

### File Naming Examples

```
src/
├── controllers/
│   ├── auth/
│   │   └── authController.js          # Auth operations
│   ├── common/
│   │   ├── profileController.js       # Profile for all users
│   │   └── locationController.js      # States/cities lookup
│   ├── panel/
│   │   ├── categoryController.js      # Category management
│   │   ├── userManagementController.js # User management
│   │   ├── dashboardController.js     # Dashboard & analytics
│   │   └── promotionController.js     # Marketing features
│   ├── end-user/
│   │   ├── listingController.js       # User's listings
│   │   └── subscriptionController.js  # User's subscriptions
│   └── public/
│       ├── listingController.js       # Browse listings
│       ├── categoryController.js      # Get categories
│       └── searchController.js        # Search
├── services/                          # FLAT - NO SUBDIRECTORIES
│   ├── authService.js
│   ├── userProfileService.js
│   ├── listingService.js
│   ├── categoryService.js
│   ├── subscriptionService.js
│   └── imageService.js
├── repositories/                      # FLAT - NO SUBDIRECTORIES
│   ├── authRepository.js
│   ├── userProfileRepository.js
│   ├── listingRepository.js
│   ├── categoryRepository.js
│   └── subscriptionRepository.js
├── middleware/                        # FLAT - NO SUBDIRECTORIES
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── uploadMiddleware.js
│   └── errorMiddleware.js
├── utils/                             # FLAT - NO SUBDIRECTORIES (except constants/)
│   ├── constants/
│   │   └── messages.js
│   ├── responseFormatter.js
│   ├── jwtHelper.js
│   └── validators.js
└── routes/
    ├── auth/
    │   └── authRoutes.js
    ├── common/
    │   ├── profileRoutes.js
    │   └── locationRoutes.js
    ├── panel/
    │   ├── categoryRoutes.js
    │   ├── dashboardRoutes.js
    │   └── userManagementRoutes.js
    ├── end-user/
    │   ├── listingRoutes.js
    │   └── subscriptionRoutes.js
    └── public/
        ├── listingRoutes.js
        ├── categoryRoutes.js
        └── searchRoutes.js
```

### Import Path Examples

```javascript
// Controllers (with subdirectories)
import AuthController from '#controllers/auth/authController.js';
import ProfileController from '#controllers/common/profileController.js';
import LocationController from '#controllers/common/locationController.js';
import CategoryController from '#controllers/panel/categoryController.js';
import PublicListingController from '#controllers/public/listingController.js';

// Services (flat - no subdirectories)
import authService from '#services/authService.js';
import userProfileService from '#services/userProfileService.js';
import listingService from '#services/listingService.js';
import categoryService from '#services/categoryService.js';

// Repositories (flat - no subdirectories)
import authRepository from '#repositories/authRepository.js';
import userProfileRepository from '#repositories/userProfileRepository.js';
import listingRepository from '#repositories/listingRepository.js';

// Middleware (flat - no subdirectories)
import authMiddleware from '#middleware/authMiddleware.js';
import uploadMiddleware from '#middleware/uploadMiddleware.js';

// Utils (flat - no subdirectories except constants/)
import { successResponse } from '#utils/responseFormatter.js';
import { SUCCESS_MESSAGES } from '#utils/constants/messages.js';
```

### Route Mounting Example

```javascript
// src/routes/index.js or src/app.js
import authRoutes from './routes/auth/authRoutes.js';
import commonProfileRoutes from './routes/common/profileRoutes.js';
import commonLocationRoutes from './routes/common/locationRoutes.js';
import panelCategoryRoutes from './routes/panel/categoryRoutes.js';
import panelDashboardRoutes from './routes/panel/dashboardRoutes.js';
import endUserListingRoutes from './routes/end-user/listingRoutes.js';
import publicListingRoutes from './routes/public/listingRoutes.js';
import publicSearchRoutes from './routes/public/searchRoutes.js';

// Mount routes
router.use('/auth', authRoutes);                           // /api/auth/*
router.use('/profile', commonProfileRoutes);               // /api/profile/*
router.use('/common', commonLocationRoutes);               // /api/common/*
router.use('/panel/categories', panelCategoryRoutes);      // /api/panel/categories/*
router.use('/panel/dashboard', panelDashboardRoutes);      // /api/panel/dashboard/*
router.use('/end-user/listings', endUserListingRoutes);    // /api/end-user/listings/*
router.use('/public/listings', publicListingRoutes);       // /api/public/listings/*
router.use('/public/search', publicSearchRoutes);          // /api/public/search/*
```

### Benefits

1. **Clear separation** of auth, panel, end-user, and public endpoints
2. **Easy to apply middleware** at route level (auth for end-user, role checks for panel)
3. **Better organization** as project grows
4. **Intuitive structure** for new developers
5. **Simplified access control** management
6. **Flat services/repositories** prevent deep nesting and import complexity

## Architecture Pattern

**Controller-Service-Repository Pattern**

### Controllers (Classes with static methods)
- Handle HTTP requests/responses
- Basic input validation
- Call service layer
- Use response formatters

### Services (Singleton classes)
- Business logic
- Orchestrate repository calls
- Handle transactions
- Return: `{ success, message, data }`

### Repositories (Singleton classes)
- Database operations only
- Pure CRUD
- No business logic

## Naming Conventions

### Files
- Controllers/Services/Repositories: `camelCase` (e.g., `authController.js`, `userService.js`)
- Models: `PascalCase` (e.g., `User.js`, `Listing.js`)
- Routes: `camelCase` (e.g., `authRoutes.js`)
- Utilities: `camelCase` (e.g., `responseFormatter.js`)

### Classes
- All classes: `PascalCase` (e.g., `AuthController`, `UserService`, `ListingRepository`)

### Variables & Functions
- Variables: `camelCase` (e.g., `userId`, `listingData`)
- Functions/Methods: `camelCase` (e.g., `getUserById`, `createListing`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`, `MAX_FILE_SIZE`)
- Private methods: Prefix with `_` (e.g., `_validateInput`)

### Database
- Tables: `snake_case` plural (e.g., `users`, `listings`, `chat_rooms`)
- Columns: `snake_case` (e.g., `user_id`, `created_at`)
- Booleans: Prefix with `is`, `has`, `can` (e.g., `is_featured`, `has_expired`)

**Primary Key Guidelines:**

Use appropriate ID types based on expected table size:

```sql
-- For high-volume tables (users, listings, messages, images, etc.)
id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY

-- For small lookup/config tables (categories, roles, plans, etc.)
id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY
```

In Sequelize migrations:
```javascript
// High-volume tables
id: {
  type: Sequelize.BIGINT,
  primaryKey: true,
  autoIncrement: true,
  allowNull: false
}

// Small tables
id: {
  type: Sequelize.INTEGER,
  primaryKey: true,
  autoIncrement: true,
  allowNull: false
}
```

**When to use BIGINT vs INT:**
- **BIGINT** (8 bytes, ~9 quintillion max): Users, listings, messages, chat_rooms, images, notifications, favorites, reviews, reports, activity_logs
- **INT** (4 bytes, ~2.1 billion max): Categories, roles, subscription_plans, locations, settings, meta_fields

**Important**: Foreign keys must match the referenced primary key type (if parent uses BIGINT, child foreign key must also be BIGINT)

**Audit Fields (Standard for Most Tables):**

Include these audit fields in most tables for tracking and soft delete support:

```javascript
// In migrations
created_by: {
  type: Sequelize.BIGINT,
  allowNull: true,
  references: {
    model: 'users',
    key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
},
updated_by: {
  type: Sequelize.JSON,  // or BIGINT - see guidelines below
  allowNull: true
},
deleted_by: {
  type: Sequelize.BIGINT,
  allowNull: true,
  references: {
    model: 'users',
    key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
},
deleted_at: {
  type: Sequelize.DATE,
  allowNull: true
}
```

**Audit Fields - updated_by Guidelines:**

1. **Low-volume tables** (< 10K rows, admin-managed):
   - Use `updated_by` as **JSON array** with full history
   - Structure: `[{userId, userName, timestamp}, ...]`
   - Examples: roles, permissions, categories, plans, settings
   - Add `beforeUpdate` hook to automatically append update records

2. **High-volume tables** (100K+ rows, user-generated):
   - Use `updated_by` as **BIGINT** (last updater only)
   - References users(id) with FK constraint
   - Examples: users, listings, messages, images
   - Add `beforeUpdate` hook to automatically set last updater

3. **Junction/immutable tables**:
   - Omit `updated_by` entirely
   - Examples: role_permissions, favorites, logs

**Rules:**
- `created_by`, `deleted_by`, `deleted_at` should be **nullable** (allowNull: true)
- `created_by` and `deleted_by` reference `users(id)` with FK constraints
- Use `paranoid: true` in Sequelize models for soft delete support
- Nullable FK constraints are valid - NULL when no user, FK enforced when NOT NULL
- **IMPORTANT**: Hooks work with nullable columns - they only populate when data is provided

**Example Hooks:**

```javascript
// Low-volume table (JSON array)
hooks: {
  beforeUpdate: async (instance, options) => {
    if (options.userId && options.userName) {
      const currentUpdates = instance.updatedBy || [];
      instance.updatedBy = [
        ...currentUpdates,
        {
          userId: options.userId,
          userName: options.userName,
          timestamp: new Date().toISOString()
        }
      ];
    }
  }
}

// High-volume table (BIGINT)
hooks: {
  beforeUpdate: async (instance, options) => {
    if (options.userId) {
      instance.updatedBy = options.userId;
    }
  }
}
```

### API Endpoints
- Format: `/api/resource` (e.g., `/api/listings`, `/api/users`)
- Naming: `kebab-case` lowercase (e.g., `/api/chat-rooms`)

**Route Design Best Practices:**

1. **Avoid Route Conflicts** - Place action/operation before ID parameter
   ```javascript
   // ✅ Correct - No conflicts
   PATCH /api/panel/subscription-plans/status/:id
   PATCH /api/panel/subscription-plans/visibility/:id
   GET /api/panel/subscription-plans/:id
   PUT /api/panel/subscription-plans/:id
   
   // ❌ Wrong - Potential conflicts
   PATCH /api/panel/subscription-plans/:id/status  // Conflicts with GET /:id
   PATCH /api/panel/subscription-plans/:id/visibility
   ```

2. **Explicit State in Toggle Endpoints** - Always send new state explicitly in request payload
   ```javascript
   // ✅ Correct - Explicit state
   PATCH /api/panel/subscription-plans/status/:id
   Body: { isActive: true }
   
   // ❌ Wrong - Implicit toggle (race conditions, unclear intent)
   PATCH /api/panel/subscription-plans/status/:id
   // No body, just toggles current state
   ```
   
   **Benefits:**
   - Frontend controls exact state
   - No race conditions
   - Clearer intent
   - Easier to test and debug
   - Idempotent operations

## Critical Rules

### 🚨 MANDATORY: ES6 Modules Only
**This project uses ES6 modules (`"type": "module"` in package.json). This is NON-NEGOTIABLE.**

```javascript
// ✅ Correct - ES6 modules
import express from 'express';
import UserService from '#services/userService.js';
export default UserController;
export { someFunction };

// ❌ WRONG - CommonJS (DO NOT USE)
const express = require('express');
module.exports = UserController;
```

**Critical Requirements:**
- ALL files must use `import/export` syntax
- ALWAYS include `.js` extension in imports (e.g., `'#services/userService.js'`)
- Use `import.meta.url` instead of `__dirname` when needed
- Sequelize migrations/seeders must also use ES6 syntax
- No `require()` or `module.exports` anywhere in the codebase

### ✅ ALWAYS Use Absolute Imports
```javascript
// ✅ Correct
import UserService from '#services/userService.js';
import { successResponse } from '#utils/responseFormatter.js';
import config from '#config/env.js';

// ❌ Wrong
import UserService from '../../services/userService.js';
```

**Configuration**: In `package.json`, use `"imports": { "#*": "./src/*" }` to enable absolute imports with the `#` prefix.

### ❌ NO Joi Validation
Use manual validation in service layer with simple checks for required fields, types, and formats. Throw descriptive errors.

```javascript
// ✅ Correct
if (!listingData.title || listingData.title.length < 10) {
  throw new Error('Title must be at least 10 characters');
}
```

### ✅ Use Constants for Response Messages
```javascript
// utils/constants/messages.js
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful'
};

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password'
};
```

Rules:
- Only success and error messages
- No nested structure
- Flat constants object
- Import and use directly

### ✅ Modern JavaScript Standards
- Use `async/await` (no callbacks or `.then()`)
- Use arrow functions for consistency
- Use template literals for strings
- Use destructuring
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### ✅ Response Formatters
All responses use standardized formatters:
- `successResponse(res, data, message)`
- `errorResponse(res, message, statusCode)`
- `paginatedResponse(res, data, pagination, message)`
- `createResponse(res, data, message)`
- `notFoundResponse(res, message)`
- `unauthorizedResponse(res, message)`
- `forbiddenResponse(res, message)`
- `validationErrorResponse(res, errors)`

## Authentication & Authorization

### JWT Token Structure

**CRITICAL: Always cache role information in JWT tokens for performance.**

JWT payload must include:
```javascript
{
  userId: 123,           // BIGINT - user ID
  roleId: 3,             // INTEGER - role ID
  roleSlug: "admin",     // VARCHAR - role slug for fast checks
  mobile:9175113022
  email: "user@example.com",
  iat: 1700000000,
  exp: 1700086400
}
```

**Why cache roleId and roleSlug?**
- ✅ Fast role checks without database query
- ✅ Middleware can check `roleSlug === 'super_admin'` instantly
- ✅ Can fetch permissions on-demand when needed
- ✅ Small token size (vs caching all permissions)

**Permission Check Flow:**
1. Decode JWT → get `roleId` and `roleSlug`
2. If `roleSlug === 'super_admin'` → allow all (bypass permission check)
3. Else → Query `role_permissions` table for specific permission
4. Optional: Cache user permissions in Redis with 5-10 minute TTL

**Example Middleware:**
```javascript
// Fast role check
if (req.user.roleSlug === 'super_admin') {
  return next();
}

// Permission check (query DB or Redis cache)
const hasPermission = await checkPermission(req.user.roleId, 'listings.approve');
if (!hasPermission) {
  return forbiddenResponse(res, 'Insufficient permissions');
}
```

## Response Format

All API responses follow this structure:
```javascript
{
  success: true,
  message: "Operation successful",
  data: { /* response data */ }
}
```

## Database Schema Documentation

**CRITICAL: Always update `DATABASE-SCHEMA.md` when:**
- Creating a new table
- Adding/modifying columns
- Creating relationships (associations)
- Adding model hooks

Keep it concise - table name, columns (with types), relationships, and hooks only.

## API Documentation

**CRITICAL: After development of any module, create API documentation in `API-Docs/` folder at project root.**

**Update API documentation whenever:**
- Service or repository code changes affect request payload
- Service or repository code changes affect response payload
- New endpoints are added
- Endpoint behavior changes

**Documentation should include:**
- Endpoint URL and HTTP method
- Request headers (authentication requirements)
- Request body schema with field descriptions
- Response format (success and error cases)
- Example requests and responses
- Status codes

## Migration Best Practices

### Handling Circular Dependencies

**Problem:** Some tables have circular foreign key dependencies (e.g., `roles` references `users` for audit fields, but `users` references `roles` for role assignment).

**Solution:**
1. **Identify circular dependencies** before creating migrations
2. **Create tables in dependency order** (parent tables first)
3. **Omit problematic FK constraints** in initial table creation
4. **Document omitted constraints** in migration comments
5. **Create a follow-up migration** to add constraints after all tables exist

**Example - Tables with Omitted Constraints:**
- `roles.created_by` → users (omitted initially)
- `roles.deleted_by` → users (omitted initially)
- `permissions.created_by` → users (omitted initially)
- `permissions.deleted_by` → users (omitted initially)
- `user_subscriptions.invoice_id` → invoices (omitted until invoices table exists)

**Follow-up Migration:**
A dedicated migration (`migrations/20251230000001-add-audit-foreign-keys.js`) adds these constraints back after all dependent tables exist.

```javascript
// Example: Adding constraint in follow-up migration
await queryInterface.addConstraint('roles', {
  fields: ['created_by'],
  type: 'foreign key',
  name: 'fk_roles_created_by',
  references: {
    table: 'users',
    field: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
});
```

**Running the Constraint Migration:**
```bash
# After all initial migrations are complete
npx sequelize-cli db:migrate
```

**Checking Missing Constraints:**
```sql
-- Check if constraints exist
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name IN ('roles', 'permissions', 'user_subscriptions');
```

### Development Mode: Schema Changes

**During active development, DO NOT create new migrations for schema changes.**

Instead:
1. Update the original migration file
2. Update the model file
3. Provide raw SQL ALTER queries to run directly on the database

**Reason:** Prevents migration clutter during rapid development. Once in production, use proper migrations for all schema changes.

**Example workflow for adding a column:**
```javascript
// 1. Update migration file
phone: {
  type: Sequelize.STRING(20),
  allowNull: true
}

// 2. Update model file
phone: {
  type: DataTypes.STRING(20),
  allowNull: true,
  field: 'phone'
}

// 3. Provide SQL query
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```
