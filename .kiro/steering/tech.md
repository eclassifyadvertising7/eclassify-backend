# Technology Stack

## 🚨 CRITICAL: ES6 Modules Only

**This project uses ES6 modules exclusively (`"type": "module"` in package.json).**

- ALL files must use `import/export` syntax
- NO `require()` or `module.exports` allowed
- ALWAYS include `.js` extension in imports
- Migrations and seeders must also use ES6 syntax

## Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4.19+)
- **Database**: PostgreSQL with JSONB support
- **ORM**: Sequelize (v6.37+)
- **Real-time**: Socket.io
- **Authentication**: JWT + Passport.js (Google OAuth)
- **Image Processing**: Sharp (compression, thumbnails)
- **File Upload**: Multer with configurable storage
- **Email**: Nodemailer
- **Logging**: Winston
- **Scheduling**: node-cron

## Storage Options

Two storage backends supported via `STORAGE_TYPE` environment variable:
- **local**: Development/testing (default)
- **cloudinary**: Production (recommended for Render deployment)

## Common Commands

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

## Environment Configuration

Key environment variables:
- `PORT`, `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_EXPIRY`
- `STORAGE_TYPE`, `UPLOAD_URL`
- `CLOUDINARY_*` (if using Cloudinary)
- `EMAIL_*` (for notifications)
- `CORS_ORIGIN`

See `.env.example` for complete list.

## Important Notes

### Sequelize Model Getters
**When using Sequelize model getters that depend on other columns, always include those columns in your `attributes` array, even if you don't directly use them in the response. The getter needs them to work!**

Example:
```javascript
// ❌ Wrong - getter won't work
attributes: ['id', 'mediaUrl', 'mediaType']

// ✅ Correct - includes columns needed by getter
attributes: ['id', 'mediaUrl', 'mediaType', 'storageType', 'mimeType']
```

### Sequelize with underscored: true - Column Names
**When using `underscored: true` in Sequelize models, you must use snake_case column names in ORDER BY and raw attributes, NOT camelCase.**

The database columns are in snake_case (e.g., `created_at`, `updated_at`), so ORDER BY and raw column references must use the actual database column names.

**ORDER BY:**
```javascript
// ❌ Wrong - will cause "column does not exist" error
order: [['createdAt', 'DESC']]
order: [['updatedAt', 'ASC']]

// ✅ Correct - use snake_case database column names
order: [['created_at', 'DESC']]
order: [['updated_at', 'ASC']]
```

**Attributes with timestamp columns:**
```javascript
// ❌ Wrong - Sequelize can't map createdAt to created_at in SELECT
attributes: ['id', 'name', 'createdAt']

// ✅ Correct - use array notation to alias snake_case to camelCase
attributes: ['id', 'name', ['created_at', 'createdAt']]
attributes: ['id', 'name', ['updated_at', 'updatedAt']]
```

**Why?** Sequelize's `underscored: true` converts camelCase to snake_case for database columns, but:
- ORDER BY clauses are passed directly to SQL
- Timestamp columns (createdAt, updatedAt) in attributes need explicit aliasing from snake_case to camelCase
