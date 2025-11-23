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

Three storage backends supported via `STORAGE_TYPE` environment variable:
- **local**: Development/testing (default)
- **cloudinary**: Production with moderate traffic (recommended)
- **s3**: Large scale production

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

# Storage migration (when switching storage types)
npm run migrate:storage -- --from=local --to=cloudinary
```

## Environment Configuration

Key environment variables:
- `PORT`, `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_EXPIRY`
- `STORAGE_TYPE`, `UPLOAD_DIR`
- `CLOUDINARY_*` (if using Cloudinary)
- `AWS_*` (if using S3)
- `EMAIL_*` (for notifications)
- `CORS_ORIGIN`

See `.env.example` for complete list.
