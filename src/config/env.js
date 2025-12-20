import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration from environment variables
 */
const config = {
  // App configuration
  app: {
    name: process.env.APP_NAME || 'EClassify',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '7d',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '30d'
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Storage configuration
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    uploadUrl: process.env.UPLOAD_URL || `http://localhost:${process.env.PORT || 5000}`,
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },

  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'eclassify_app'
  },

  // AWS S3 configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET
  },

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    secure: process.env.EMAIL_SECURE === 'true' || false
  },

  // SMS configuration
  sms: {
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID || 'ECLASSIFY'
  },

  // OTP configuration
  otp: {
    channel: process.env.OTP_CHANNEL || 'sms' // 'sms' or 'email'
  },

  // Google OAuth configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  },

  // Invoice & Transaction configuration
  invoice: {
    prefix: process.env.INVOICE_PREFIX || 'ECA',
    transactionPrefix: process.env.TRANSACTION_PREFIX || 'TXN'
  }
};

// Validate required environment variables
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingVars = requiredVars.filter(varName => {
  const keys = varName.split('.');
  let value = process.env;
  for (const key of keys) {
    value = value?.[key];
  }
  return !value;
});

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

export default config;