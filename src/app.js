import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import passport from '#config/passport.js';
import routes from '#routes/index.js';
import errorHandler from '#middleware/errorHandler.js';

// Initialize Express application
const app = express();

// Apply helmet middleware for security headers with CORS-friendly configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Configure CORS middleware with hardcoded origins plus environment variable
const allowedOrigins = [
  'http://localhost:3000',
  'https://eclassify-frontend.vercel.app',
  'http://eclassify-frontend.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));

// Add body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware for OAuth (only needed for temporary state storage)
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000 // 10 minutes (just for OAuth flow)
  }
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory with CORS headers
app.use('/uploads', cors(corsOptions), express.static('uploads'));

// Mount API routes under /api prefix
app.use('/api', routes);

// Apply error handler middleware as last middleware
app.use(errorHandler);

// Export Express app instance
export default app;
