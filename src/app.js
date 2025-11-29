import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
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

// Serve static files from uploads directory with CORS headers
app.use('/uploads', cors(corsOptions), express.static('uploads'));

// Mount API routes under /api prefix
app.use('/api', routes);

// Apply error handler middleware as last middleware
app.use(errorHandler);

// Export Express app instance
export default app;
