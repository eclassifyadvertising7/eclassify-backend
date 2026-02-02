# Steering Guidelines Reference

This document consolidates all custom guidelines and instructions from the `.kiro/steering/` folder for quick reference.

---

## 1. Model Management Guidelines (model-management.md)

### Critical Rule: Always Register Models in Index

**🚨 MANDATORY: Every new Sequelize model MUST be added to `src/models/index.js` immediately after creation.**

#### Model Registration Checklist
- [ ] Create model file in `src/models/`
- [ ] Add import to `src/models/index.js`
- [ ] Add model to the `models` object
- [ ] Add `YourModel.associate(models)` call
- [ ] Test that model methods work (`.count()`, `.findAll()`, etc.)

#### Always Import Models from Index
```javascript
// ✅ Correct - Import from index
import models from '#models/index.js';
const { YourModel, User, Listing } = models;

// ❌ Wrong - Direct import
import YourModel from '#models/YourModel.js';
```

#### Best Practices
1. Keep models in alphabetical order in the index file
2. Group association calls by feature/domain
3. Use PascalCase for model names
4. Add to index.js immediately after creating model file
5. Test basic operations (count, findAll) after registration

---

## 2. Product Overview

### Platform Type

### Core Features


### User Roles
- **user**: External users (buyers/sellers)
- **super_admin**: Full system access, manage roles
- **admin**: Approve listings, manage users
- **accountant**: Financial management, billing, payments
- **marketing**: Feature listings, promotions
- **seo**: Content optimization, meta tags

### Account Types


---

## 3. Project Structure & Architecture (structure.md)

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
- **Purpose**: User authentication, token management, session handling
- **Access**: Public (no authentication required)
- **API Path**: `/api/auth/*`

#### 2. `common/` - Shared Resources
- **Purpose**: Resources accessible to multiple user types (end-users and admins)
- **Access**: Mixed (some public, some require authentication, some admin-only)
- **API Paths**: `/api/profile/*`, `/api/common/*`

#### 3. `panel/` - Admin/Staff Panels
- **Purpose**: All admin and staff operations (super_admin, admin, marketing, seo, accountant, sales)
- **Access**: Requires authentication + specific role permissions
- **API Path**: `/api/panel/*`

#### 4. `end-user/` - End-User Operations
- **Purpose**: End-user's own resources and operations
- **Access**: Requires authentication (user role)
- **API Path**: `/api/end-user/*`

#### 5. `public/` - Public APIs
- **Purpose**: Publicly accessible endpoints (no authentication required)
- **Access**: Public (no authentication required)
- **API Path**: `/api/public/*`

### Architecture Pattern

**Controller-Service-Repository Pattern**

- **Controllers** (Classes with static methods): Handle HTTP requests/responses, basic input validation, call service layer, use response formatters
- **Services** (Singleton classes): Business logic, orchestrate repository calls, handle transactions, return `{ success, message, data }`
- **Repositories** (Singleton classes): Database operations only, pure CRUD, no business logic

### Naming Conventions

#### Files
- Controllers/Services/Repositories: `camelCase` (e.g., `authController.js`, `userService.js`)
- Models: `PascalCase` (e.g., `User.js`, `Listing.js`)
- Routes: `camelCase` (e.g., `authRoutes.js`)
- Utilities: `camelCase` (e.g., `responseFormatter.js`)

#### Classes
- All classes: `PascalCase` (e.g., `AuthController`, `UserService`, `ListingRepository`)

#### Variables & Functions
- Variables: `camelCase` (e.g., `userId`, `listingData`)
- Functions/Methods: `camelCase` (e.g., `getUserById`, `createListing`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`, `MAX_FILE_SIZE`)
- Private methods: Prefix with `_` (e.g., `_validateInput`)

#### Database
- Tables: `snake_case` plural (e.g., `users`, `listings`, `chat_rooms`)
- Columns: `snake_case` (e.g., `user_id`, `created_at`)
- Booleans: Prefix with `is`, `has`, `can` (e.g., `is_featured`, `has_expired`)

### Primary Key Guidelines

**Use appropriate ID types based on expected table size:**

- **BIGINT** (8 bytes, ~9 quintillion max): Users, listings, messages, chat_rooms, images, notifications, favorites, reviews, reports, activity_logs
- **INT** (4 bytes, ~2.1 billion max): Categories, roles, subscription_plans, locations, settings, meta_fields

**Important**: Foreign keys must match the referenced primary key type

### Audit Fields (Standard for Most Tables)

Include these audit fields in most tables:
- `created_by` (BIGINT, nullable, references users)
- `updated_by` (JSON or BIGINT - see guidelines below)
- `deleted_by` (BIGINT, nullable, references users)
- `deleted_at` (DATE, nullable)

#### updated_by Guidelines:

1. **Low-volume tables** (< 10K rows, admin-managed):
   - Use `updated_by` as **JSON array** with full history
   - Structure: `[{userId, userName, timestamp}, ...]`
   - Examples: roles, permissions, categories, plans, settings

2. **High-volume tables** (100K+ rows, user-generated):
   - Use `updated_by` as **BIGINT** (last updater only)
   - References users(id) with FK constraint
   - Examples: users, listings, messages, images

3. **Junction/immutable tables**:
   - Omit `updated_by` entirely
   - Examples: role_permissions, favorites, logs

### API Endpoints

- Format: `/api/resource` (e.g., `/api/listings`, `/api/users`)
- Naming: `kebab-case` lowercase (e.g., `/api/chat-rooms`)

#### Route Design Best Practices:

1. **Avoid Route Conflicts** - Place action/operation before ID parameter
   ```javascript
   // ✅ Correct - No conflicts
   PATCH /api/panel/subscription-plans/status/:id
   GET /api/panel/subscription-plans/:id
   
   // ❌ Wrong - Potential conflicts
   PATCH /api/panel/subscription-plans/:id/status
   ```

2. **Explicit State in Toggle Endpoints** - Always send new state explicitly in request payload
   ```javascript
   // ✅ Correct - Explicit state
   PATCH /api/panel/subscription-plans/status/:id
   Body: { isActive: true }
   
   // ❌ Wrong - Implicit toggle
   PATCH /api/panel/subscription-plans/status/:id
   // No body, just toggles current state
   ```

### 🚨 CRITICAL: Code Comments Policy

**DO NOT write JSDoc comments or unnecessary lengthy comments. Keep code clean**

**Rules:**
- ❌ NO JSDoc comments (`/** */` style documentation)
- ❌ NO function/method documentation blocks
- ❌ NO parameter type annotations in comments
- ❌ NO return type documentation
- ❌ NO verbose explanatory comments for obvious code
- ❌ NO business logic explanation
- ✅ ONLY write comments for:
  - Important warnings or gotchas for future developers
  - Temporary workarounds or TODOs with context
  - Critical security or performance considerations

### 🚨 MANDATORY: ES6 Modules Only

**This project uses ES6 modules (`"type": "module"` in package.json). This is NON-NEGOTIABLE.**

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

// ❌ Wrong
import UserService from '../../services/userService.js';
```

### ❌ NO Joi Validation

Use manual validation in service layer with simple checks for required fields, types, and formats. Throw descriptive errors.

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

**Rules:**
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
- `successResponse(res, data, message, code)` - 200 OK
- `errorResponse(res, message, statusCode, code)` - Custom error
- `paginatedResponse(res, data, pagination, message, code)` - Paginated data
- `createResponse(res, data, message, code)` - 201 Created
- `notFoundResponse(res, message, code)` - 404 Not Found
- `unauthorizedResponse(res, message, code)` - 401 Unauthorized
- `forbiddenResponse(res, message, code)` - 403 Forbidden
- `validationErrorResponse(res, errors, code)` - 422 Validation Error

### JWT Token Structure

**CRITICAL: Always cache role information in JWT tokens for performance.**

JWT payload must include:
```javascript
{
  userId: 123,           // BIGINT - user ID
  roleId: 3,             // INTEGER - role ID
  roleSlug: "admin",     // VARCHAR - role slug for fast checks
  mobile: 9175113022,
  email: "user@example.com",
  iat: 1700000000,
  exp: 1700086400
}
```

**Permission Check Flow:**
1. Decode JWT → get `roleId` and `roleSlug`
2. If `roleSlug === 'super_admin'` → allow all (bypass permission check)
3. Else → Query `role_permissions` table for specific permission
4. Optional: Cache user permissions in Redis with 5-10 minute TTL

### Response Format

All API responses follow this structure:
```javascript
{
  success: true/false,
  message: "Human-readable message",
  code: "APPLICATION_CODE",  // Application-level error code
  data: { /* response data */ },
  pagination: { /* optional */ }
}
```

**Why `code` field?**

HTTP status codes alone are insufficient:
- 400 Bad Request - Could be validation, missing field, or business rule
- 401 Unauthorized - Could be expired token, invalid token, or missing token
- 403 Forbidden - Could be insufficient permissions, suspended account, or quota exceeded

**Examples:**
```javascript
// Success
{ success: true, code: "USER_CREATED", message: "User created", data: {...} }

// Same HTTP 400, different codes
{ success: false, code: "MISSING_FIELDS", message: "Email required", data: null }
{ success: false, code: "INVALID_FORMAT", message: "Invalid email", data: null }
{ success: false, code: "BUSINESS_RULE_VIOLATION", message: "Age must be 18+", data: null }

// Same HTTP 401, different codes
{ success: false, code: "TOKEN_EXPIRED", message: "Session expired", data: null }
{ success: false, code: "TOKEN_INVALID", message: "Invalid token", data: null }
```

**Code Constants:** Define in `utils/constants/codes.js`
```javascript
export const SUCCESS_CODES = { SUCCESS: 'SUCCESS', CREATED: 'CREATED', ... };
export const ERROR_CODES = { 
  MISSING_FIELDS: 'MISSING_FIELDS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  ...
};
```

### Database Schema Documentation

**CRITICAL: Always update `DATABASE-SCHEMA.md` when:**
- Creating a new table
- Adding/modifying columns
- Creating relationships (associations)
- Adding model hooks

Keep it concise - table name, columns (with types), relationships, and hooks only.

### Documentation Guidelines

#### 🚨 CRITICAL: Minimize Documentation

**DO NOT create unnecessary documents. Create ONLY what is essential.**

#### Required Documentation

1. **API Documentation** (`API-Docs/` folder)
   - **ONE document per feature/module** (e.g., `API-Docs/listings.md`)
   - Include: endpoints, parameters, request/response examples, error codes
   - This is the ONLY document frontend developers need

2. **Database Schema** (`DATABASE-SCHEMA.md`)
   - Update when creating/modifying tables
   - Keep concise: table name, columns, relationships, hooks only

#### ❌ DO NOT Create

- Summary documents
- Implementation documents
- Quick reference guides (info should be in main API doc)
- Checklists (use project management tools instead)
- Testing guides (separate from API docs)
- Multiple documents for the same feature
- Redundant documentation

#### 🚨 CRITICAL: API Documentation Format

**DO NOT include frontend integration code in API documentation.**

**Prohibited Content:**
- ❌ NO React/Vue/JavaScript examples
- ❌ NO sample frontend implementations
- ❌ NO client-side code snippets
- ❌ NO HTML/CSS examples
- ❌ NO frontend library usage examples
- ❌ NO cURL examples
- ❌ NO Postman collections

**Required Format for Each Endpoint:**

```markdown
### Endpoint Title

**Method and Endpoint**
```
POST /api/resource/action
```

**Authentication Required:** Yes/No (specify role if needed)

**Request Payload**

Query Parameters:
- `param1` (string, optional) - Description
- `param2` (integer, required) - Description

Form Data Fields:
- `field1` (file, required) - Description
- `field2` (string, optional) - Description

JSON Payload:
```json
{
  "field1": "value",
  "field2": 123,
  "nestedObject": {
    "subField": "value"
  }
}
```

**Response Payload**

Success Response (200):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "field1": "value",
    "field2": 123
  }
}
```

**Error Response**

```json
{
  "success": false,
  "message": "Error description"
}
```

**Notes:**
- Any important considerations
- Validation rules
- Business logic constraints
```

**Rules:**
- Focus PURELY on API endpoints, parameters, and responses
- Include ALL query parameters, filters, form data fields, and JSON payload fields
- Include ONLY ONE error response example (even if multiple error scenarios exist)
- Specify authentication requirements clearly
- Document all field types and whether they're required/optional

### Migration Best Practices

#### Handling Circular Dependencies

**Problem:** Some tables have circular foreign key dependencies (e.g., `roles` references `users` for audit fields, but `users` references `roles` for role assignment).

**Solution:**
1. Identify circular dependencies before creating migrations
2. Create tables in dependency order (parent tables first)
3. Omit problematic FK constraints in initial table creation
4. Document omitted constraints in migration comments
5. Create a follow-up migration to add constraints after all tables exist

**Example - Tables with Omitted Constraints:**
- `roles.created_by` → users (omitted initially)
- `roles.deleted_by` → users (omitted initially)
- `permissions.created_by` → users (omitted initially)
- `permissions.deleted_by` → users (omitted initially)
- `user_subscriptions.invoice_id` → invoices (omitted until invoices table exists)

#### Development Mode: Schema Changes

**During active development, DO NOT create new migrations for schema changes.**

Instead:
1. Update the original migration file
2. Update the model file
3. Provide raw SQL ALTER queries to run directly on the database

**Reason:** Prevents migration clutter during rapid development. Once in production, use proper migrations for all schema changes.

### URL Transformation Standard

**Backend always saves relative paths in database. Use Sequelize model getters to serve full URLs to frontend.**

#### Database Storage
Always store relative paths:
```
uploads/user-123/images/photo (Without extension)
```

#### Model Getters
Add getters to any model with file path columns using `getFullUrl()` helper from `#utils/storageHelper.js`

#### Models with File Paths
- `ChatMessage` - `mediaUrl`, `thumbnailUrl` (requires `storageType`, `mimeType`, `thumbnailMimeType`)
- `UserProfile` - `profilePhoto` (requires `storageType`, `mimeType`)

**Important:** Always include storage_type and mime_type columns alongside file path columns for proper URL generation.

### Slug & Filename Generation

**Use `utils/customSlugify.js` for all slug and filename generation needs.**

**Dependencies:** `npm install slugify`

**Functions:**
- `customSlugify(text, options)` - Generate URL-friendly slugs (max 20 chars, lowercase, no special chars)
- `generateFileName(originalFilename)` - Generate unique filename: `{timestamp}-{slug}-{random}.{ext}`
- `getIndianTimestamp()` - Get IST timestamp in YYYYMMDDHHMMSS format
- `generateShareCode(limit)` - Generate uppercase alphanumeric codes (excludes 0, O, I, 1)
- `generateAlphaNumericCode(limit)` - Generate lowercase alphanumeric codes (internal use)

**Use Cases:**
- Category slugs, product slugs, user-friendly URLs
- Unique file uploads with collision prevention
- Referral codes, invite codes, short links
- Consistent timezone handling for file naming

---

## 4. Technology Stack (tech.md)

### 🚨 CRITICAL: ES6 Modules Only

**This project uses ES6 modules exclusively (`"type": "module"` in package.json).**

- ALL files must use `import/export` syntax
- NO `require()` or `module.exports` allowed
- ALWAYS include `.js` extension in imports
- Migrations and seeders must also use ES6 syntax

### Backend Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with JSONB support
- **ORM**: Sequelize
- **Real-time**: Socket.io
- **Authentication**: JWT + Passport.js (Google OAuth)
- **Image Processing**: Sharp (compression, thumbnails)
- **File Upload**: Multer with configurable storage
- **Email**: Nodemailer
- **Logging**: Winston
- **Scheduling**: node-cron

### Storage Options

Two storage backends supported via `STORAGE_TYPE` environment variable:
- **local**: Development/testing (default)
- **cloudinary**: Production (recommended for Render deployment)

### Common Commands

```bash
# Install dependencies
npm install

# Database setup
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Development
npm run dev

# Production
npm start

# Switch storage type (just change env variable and restart)
# STORAGE_TYPE=local or STORAGE_TYPE=cloudinary
```

### Environment Configuration

Key environment variables:
- `PORT`, `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_EXPIRY`
- `STORAGE_TYPE`, `UPLOAD_URL`
- `CLOUDINARY_*` (if using Cloudinary)
- `EMAIL_*` (for notifications)
- `CORS_ORIGIN`

See `.env.example` for complete list.

### Sequelize Model Getters

**When using Sequelize model getters that depend on other columns, always include those columns in your `attributes` array, even if you don't directly use them in the response. The getter needs them to work!**

Example:
```javascript
// ❌ Wrong - getter won't work
attributes: ['id', 'mediaUrl', 'mediaType']

// ✅ Correct - includes columns needed by getter
attributes: ['id', 'mediaUrl', 'mediaType', 'storageType', 'mimeType']
```

### 🚨 CRITICAL: Sequelize with underscored: true - Column Names

**THIS IS A COMMON ERROR - READ CAREFULLY!**

**When using `underscored: true` in Sequelize models, you MUST use snake_case column names in ORDER BY clauses, NOT camelCase.**

The database columns are stored in snake_case (e.g., `created_at`, `updated_at`). Sequelize's `underscored: true` setting does NOT convert column names in ORDER BY clauses - they are passed directly to SQL.

#### ORDER BY - ALWAYS Use snake_case

```javascript
// ❌ WRONG - Will cause "column createdAt does not exist" error
order: [['createdAt', 'DESC']]
order: [['updatedAt', 'ASC']]

// ✅ CORRECT - Use actual database column names (snake_case)
order: [['created_at', 'DESC']]
order: [['updated_at', 'ASC']]
order: [['display_order', 'ASC']]
order: [['view_count', 'DESC']]
```

#### Attributes with Timestamp Columns - Use Array Notation

```javascript
// ❌ WRONG - Sequelize can't map createdAt to created_at in SELECT
attributes: ['id', 'name', 'createdAt']

// ✅ CORRECT - Use array notation to alias snake_case to camelCase
attributes: ['id', 'name', ['created_at', 'createdAt']]
attributes: ['id', 'name', ['updated_at', 'updatedAt']]
```

#### Why This Happens

Sequelize's `underscored: true` setting:
- ✅ **DOES convert** model attributes (JavaScript) ↔ database columns automatically
- ✅ **DOES convert** WHERE clause field names
- ✅ **DOES convert** automatic timestamp fields (createdAt → created_at)
- ❌ **DOES NOT convert** ORDER BY column names (passed directly to SQL)
- ❌ **DOES NOT convert** raw SQL column references

**Rule of thumb:** In ORDER BY, use the actual database column name (snake_case), not the JavaScript model attribute name (camelCase).

#### Common Mistakes to Avoid

```javascript
// ❌ WRONG
order: [['createdAt', 'DESC']]        // Error: column "createdAt" does not exist
order: [['updatedAt', 'ASC']]         // Error: column "updatedAt" does not exist
order: [['displayOrder', 'ASC']]      // Error: column "displayOrder" does not exist
order: [['viewCount', 'DESC']]        // Error: column "viewCount" does not exist

// ✅ CORRECT
order: [['created_at', 'DESC']]       // Works!
order: [['updated_at', 'ASC']]        // Works!
order: [['display_order', 'ASC']]     // Works!
order: [['view_count', 'DESC']]       // Works!
```

**Remember:** When in doubt, check your migration file to see the actual database column name!

---
