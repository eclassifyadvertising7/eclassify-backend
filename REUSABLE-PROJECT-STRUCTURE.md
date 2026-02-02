# Reusable Project Structure Template

This document provides a generic, reusable folder structure and utility naming conventions for Node.js/Express backend projects using the Controller-Service-Repository pattern.

---

## Technology Stack

**Backend:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with JSONB support
- **ORM**: Sequelize
- **Real-time**: Socket.io (optional)
- **Authentication**: JWT + Passport.js (Google OAuth - optional)
- **Image Processing**: Sharp (compression, thumbnails)
- **File Upload**: Multer with configurable storage
- **Email**: Nodemailer
- **Logging**: Winston
- **Scheduling**: node-cron (optional)

**Storage Options:**
- **local**: Development/testing (default)
- **cloudinary**: Production (recommended)
- **aws-s3**: Enterprise (optional)

**Module System:**
- **ES6 Modules Only** (`"type": "module"` in package.json)
- NO CommonJS (`require`/`module.exports`)
- ALWAYS include `.js` extension in imports

---

## 🚨 Critical Rules

### 1. NO Validation Libraries (Joi/Zod/Express-Validator)

**Reasons:**
- Extra dependencies and overhead
- Generic, unhelpful error messages

**Use instead:**
- ✅ Plain JavaScript `if` statements
- ✅ Regex for format validation
- ✅ For common fields like mobile , email use custom validation functions in `utils/validationHelper.js`
- ✅ Throw descriptive errors with business context

### 2. NO Test Files in Project Structure

**Tests are optional and project-specific.**

### 3. Two-Layer Validation Strategy (MANDATORY)

**If validation are present they must happen in two layers: Controller and Service.**

#### Controller Layer (Minimal Validation)

**Purpose:** Fast fail for obviously bad requests

**What to validate:**
- ✅ Basic presence checks (required fields exist)
- ✅ Type checks (is it a number/string/array?)
- ✅ Format checks (email format, phone format)
- ✅ File upload validation (size, type, count)

#### Service Layer (Business Logic Validation)

**Purpose:** Enforce business rules and data integrity

**What to validate:**
- ✅ Business rules (age >= 18, price > 0)
- ✅ Data consistency (unique email, valid category)
- ✅ Relationships (user exists, category is active)
- ✅ Complex validations (password strength, quota limits)
- ✅ State transitions (can't approve rejected request)


## Complete Folder Structure

```
project-root/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Database connection (Sequelize/Mongoose/Prisma)
│   │   ├── env.js           # Environment variables loader and validator
│   │   ├── logger.js        # Winston/Pino logger configuration
│   │   ├── passport.js      # Passport.js authentication strategies (optional)
│   │   ├── storageConfig.js # Storage configuration (local/cloud)
│   │   └── uploadConfig.js  # File upload configuration (Multer)
│   │
│   ├── controllers/         # Request handlers (SUBDIRECTORIES ALLOWED)
│   │   ├── auth/            # Authentication controllers
│   │   │   └── authController.js
│   │   ├── common/          # Shared resource controllers
│   │   │   └── locationController.js
│   │   ├── panel/           # Admin/staff panel controllers
│   │   │   ├── dashboardController.js
│   │   ├── end-user/        # End-user controllers
│   │   │   ├── resourceController.js
│   │   │   └── subscriptionController.js
│   │   └── public/          # Public API controllers (no auth)
│   │       ├── resourceController.js
│   │       └── searchController.js
│   │
│   ├── services/            # Business logic (FLAT - NO SUBDIRECTORIES)
│   │   ├── authService.js
│   │   ├── emailService.js
│   │
│   ├── repositories/        # Database operations (FLAT - NO SUBDIRECTORIES)
│   │   ├── authRepository.js
│   │
│   ├── models/              # Database models (ORM/ODM)
│   │   ├── index.js         # Model registry and associations
│   │   ├── User.js
│   │
│   ├── middleware/          # Express middleware (FLAT - NO SUBDIRECTORIES)
│   │   ├── authMiddleware.js        # JWT authentication
│   │
│   ├── routes/              # API routes (SUBDIRECTORIES ALLOWED)
│   │   ├── index.js         # Main router (mounts all routes)
│   │   ├── auth/
│   │   │   └── authRoutes.js
│   │   ├── common/
│   │   │   └── locationRoutes.js
│   │   ├── panel/
│   │   │   ├── dashboardRoutes.js
│   │   ├── end-user/
│   │   │   ├── resourceRoutes.js
│   │   │   └── subscriptionRoutes.js
│   │   └── public/
│   │       ├── resourceRoutes.js
│   │       └── searchRoutes.js
│   │
│   ├── utils/               # Utility functions (FLAT - NO SUBDIRECTORIES except constants/)
│   │   ├── constants/       # Constants (ONLY SUBDIRECTORY ALLOWED)
│   │   │   ├── codes.js             # Application response codes (SUCCESS_CODES, ERROR_CODES)
│   │   │   ├── messages.js          # Success/error messages
│   │   │   ├── statusCodes.js       # HTTP status codes
│   │   │   ├── roles.js             # Role constants
│   │   │   ├── permissions.js       # Permission constants
│   │   │   └── enums.js             # Enumerations
│   │   ├── responseFormatter.js     # Standardized API responses
│   │   ├── jwtHelper.js             # JWT token utilities
│   │
│   │   │
│   ├── jobs/                # Scheduled jobs and background tasks
│   │   ├── emailJobs.js
│   │   ├── notificationJobs.js
│   │
│   ├── socket/              # WebSocket/Socket.io handlers
│   │   ├── index.js
│   │   ├── chatHandler.js
│   │   ├── notificationHandler.js
│   │
│   ├── queues/              # Queue processors (Bull/BullMQ)
│   │   ├── emailQueue.js
│   │   ├── imageQueue.js
│   │   └── [feature]Queue.js
│   │
│   ├── events/              # Event emitters and listeners
│   │   ├── userEvents.js
│   │
│   ├── app.js               # Express app setup (middleware, routes)
│   └── server.js            # Server entry point (HTTP/HTTPS server)
│
├── migrations/              # Database migrations (Sequelize/Knex)
│   └── YYYYMMDDHHMMSS-migration-name.js
│
├── seeders/                 # Database seeders
│   └── YYYYMMDDHHMMSS-seeder-name.js
│
├── docs/                    # Documentation
│   ├── API-Docs/            # API documentation
│   │   ├── README.md
│   │   ├── authentication.md
│   │   └── [feature].md
│   ├── DATABASE-SCHEMA.md   # Database schema documentation
│
├── uploads/                 # Local file uploads (if using local storage)
│   ├── images/
│   ├── documents/
│   └── temp/
│
├── logs/                    # Application logs
│   ├── error.log
│   ├── combined.log
│   └── access.log
│
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── .sequelizerc             # Sequelize CLI configuration (if using Sequelize)
├── package.json             # NPM dependencies and scripts
├── package-lock.json        # NPM lock file
└── README.md                # Project README
```

---

## Core Utility Files (Reusable Across Projects)

### 1. Response Formatter (`utils/responseFormatter.js`)

**Purpose:** Standardized API response structure with application-level error codes

**Functions:**
- `successResponse(res, data, message, code)` - 200 OK
- `createResponse(res, data, message, code)` - 201 Created
- `errorResponse(res, message, statusCode, code)` - Custom error
- `notFoundResponse(res, message, code)` - 404 Not Found
- `unauthorizedResponse(res, message, code)` - 401 Unauthorized
- `forbiddenResponse(res, message, code)` - 403 Forbidden
- `validationErrorResponse(res, errors, code)` - 422 Validation Error
- `paginatedResponse(res, data, pagination, message, code)` - Paginated data

**Response Structure:**
```javascript
{
  success: true/false,
  message: "Human-readable message",
  code: "APPLICATION_CODE", 
  data: { /* response data */ },
  pagination: { /* pagination metadata (optional) */ }
}
```

**Why `code` field?**

HTTP status codes alone are not enough to handle specific scenarios:
- 400 Bad Request - Could be validation, missing field, or business rule violation

### 7. Slug & Filename Helper (`utils/customSlugify.js`)

**Purpose:** URL-friendly slug generation and unique filename generation

**Dependencies:** 
```bash
npm install slugify
```

**Functions:**

#### `customSlugify(text, options)`
Generate URL-friendly slugs from text

#### `generateFileName(originalFilename)`
Generate unique filename with timestamp and random code

#### `getIndianTimestamp()`
Get current timestamp in IST timezone (YYYYMMDDHHMMSS format)

#### `generateAlphaNumericCode(limit)` (Internal)
Generate lowercase alphanumeric code for internal use

#### `generateShareCode(limit)`
Generate uppercase alphanumeric share code (excludes confusing chars: 0, O, I, 1)

### 8. File Helper (`utils/fileHelper.js`)

**Purpose:** File operations

**Functions:**
- `deleteFile(filePath)` - Delete file
- `getFileExtension(filename)` - Get extension
- `generateUniqueFilename(originalName)` - Generate unique name (use `generateFileName` from customSlugify instead)

### 9. Storage Helper (`utils/storageHelper.js`)

**Purpose:** Storage-agnostic file operations

**Functions:**
- `uploadFile(file, options)` - Upload to configured storage
- `deleteFile(filePath)` - Delete from storage
- `getFullUrl(relativePath, storageType, mimeType)` - Get full URL
- `getSignedUrl(filePath)` - Get signed URL (for private files)

### 10. Validation Helper (`utils/validationHelper.js`)

**Purpose:** Common validation functions

**Functions:**
- `isValidEmail(email)` - Validate email
- `isValidPhone(phone)` - Validate phone
- `sanitizeInput(input)` - Sanitize user input

### 11. Constants

#### A. Response Codes (`utils/constants/codes.js`)

**Purpose:** Application-level codes for frontend error handling

**Structure:**
```javascript
// Success codes
export const SUCCESS_CODES = {
  SUCCESS: 'SUCCESS',
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED'
};

// Error codes
export const ERROR_CODES = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_LENGTH: 'INVALID_LENGTH'
};
```

**Code Naming Convention:**
- Format: `CATEGORY_SPECIFIC_ERROR`
- Use UPPER_SNAKE_CASE
- Be specific and descriptive
- Group by HTTP status code category

### 3. Logger Config (`config/logger.js`)

**Purpose:** Winston logger setup

**Functions:**
- `logger.info(message)` - Info logs
- `logger.error(message)` - Error logs
- `logger.warn(message)` - Warning logs
- `logger.debug(message)` - Debug logs

---

## Key Principles

1. **Flat Structure for Services/Repositories/Middleware/Utils** - No subdirectories (except `utils/constants/`)
2. **Subdirectories Only for Controllers/Routes** - Organized by access level
3. **Consistent Naming** - `[feature]Service.js`, `[feature]Repository.js`, `[feature]Controller.js`
4. **Single Responsibility** - Each file has one clear purpose
5. **Reusable Utilities** - Generic helpers that work across projects
6. **Centralized Configuration** - All config in `config/` folder
7. **Standardized Responses** - Use response formatters everywhere
8. **Centralized Constants** - All messages in `utils/constants/`

---
