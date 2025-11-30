# Classified Platform Backend

Scalable classified advertising platform (OLX-style) for cars and properties with dynamic categories, real-time chat, and subscription-based pricing.

## Tech Stack

- **Node.js (v18+)** + Express.js + PostgreSQL + Sequelize ORM
- **Auth**: JWT (caches `userId`, `roleId`, `roleSlug`) + Passport.js (Google OAuth)
- **Storage**: Local/Cloudinary (storage-agnostic) with Sharp image processing
- **Real-time**: Socket.io
- **Email**: Nodemailer | **Logging**: Winston | **Scheduling**: node-cron

## Architecture

**Controller-Service-Repository Pattern**

- **Controllers** (static methods): Handle HTTP, call services, use response formatters
- **Services** (singleton): Business logic, orchestrate repositories, return `{ success, message, data }`
- **Repositories** (singleton): Database operations only, pure CRUD

## Naming Conventions

- **Files**: `camelCase` (controllers, services, repos, routes, utils) | `PascalCase` (models)
- **Classes**: `PascalCase` | **Variables/Functions**: `camelCase` | **Constants**: `UPPER_SNAKE_CASE`
- **Private Methods**: Prefix `_` (e.g., `_validateInput`)
- **Database**: Tables `snake_case` plural | Columns `snake_case` | Booleans prefix `is/has/can`

**Primary Keys**: Use `BIGINT` for high-volume tables (users, listings, messages), `INT` for small tables (categories, roles, plans). FKs must match parent type.

**Audit Fields**: All nullable
- `created_by`, `deleted_by` (BIGINT, FK to users)
- `updated_by`: JSON array (low-volume) or BIGINT (high-volume)
- `deleted_at` (TIMESTAMP)

**API Endpoints**: `/api/resource` in `kebab-case` (e.g., `/api/chat-rooms`)

## Key Rules

**🚨 ES6 Modules Only**: Use `import/export`, always include `.js` extension, no `require()`

**Absolute Imports**: Use `#` prefix (e.g., `import UserService from '#services/userService.js'`)

**No Joi**: Manual validation in services, throw descriptive errors

**Constants**: Flat message constants in `utils/constants/messages.js`

**Modern JS**: `async/await`, arrow functions, template literals, destructuring, optional chaining

**Response Formatters**: `successResponse`, `errorResponse`, `paginatedResponse`, etc.

## Project Structure

```
src/
├── config/          # Database, passport, storage
├── controllers/     # auth/, panel/, end-user/, public/ (subdirs only here)
├── services/        # Business logic (flat, no subdirs)
├── repositories/    # DB operations (flat, no subdirs)
├── models/          # Sequelize models
├── middleware/      # Auth, validation, errors (flat)
├── routes/          # auth/, panel/, end-user/, public/ (subdirs only here)
├── utils/           # Helpers, formatters, constants (flat)
├── uploads/         # Upload config
├── socket/          # Socket.io handlers
└── jobs/            # Cron jobs
```

**Subdirectories only in**: `controllers/` and `routes/` (organized by access level: auth, panel, end-user, public)

## Environment

See `.env.example` for all variables. Required: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `UPLOAD_URL`

## Quick Start

```bash
# Install
npm install

# Setup .env
cp .env.example .env
# Edit: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, UPLOAD_URL

# Database
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all  # optional

# Run
npm run dev  # development
npm start    # production
```

Server: `http://localhost:5000`

## API

Base: `http://localhost:5000/api`

Response format: `{ success, message, data }`

See `API-Docs/` folder for endpoint documentation.

## Storage & URL Transformation

**Storage-Agnostic Design**: Switch between local/Cloudinary by changing `STORAGE_TYPE` env variable.

**Rule**: Store relative paths (without extension) in DB, use model getters to generate full URLs.

```javascript
// Model getter
import { getFullUrl } from '#utils/storageHelper.js';

mediaUrl: {
  type: DataTypes.STRING(500),
  field: 'media_url',
  get() {
    const rawValue = this.getDataValue('mediaUrl');
    const storageType = this.getDataValue('storageType');
    const mimeType = this.getDataValue('mimeType');
    return getFullUrl(rawValue, storageType, mimeType);
  }
}
```

**DB**: `uploads/listings/user-123/images/photo` (no extension)  
**Local API**: `http://localhost:5000/uploads/listings/user-123/images/photo.jpg`  
**Cloudinary API**: `https://res.cloudinary.com/.../eclassify_app/uploads/listings/user-123/images/photo.jpg`

**⚠️ Important**: When using model getters that depend on other columns, always include those columns in `attributes` array:

```javascript
// ✅ Correct
attributes: ['id', 'mediaUrl', 'storageType', 'mimeType']

// ❌ Wrong - getter won't work
attributes: ['id', 'mediaUrl']
```

Apply to: `ListingMedia`, `Category`, `UserProfile`

## Documentation

- **API Docs**: `API-Docs/` folder
- **Database Schema**: `DATABASE-SCHEMA.md`
