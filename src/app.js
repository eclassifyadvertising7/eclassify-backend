import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from '#routes/index.js';
import errorHandler from '#middleware/errorHandler.js';

// Initialize Express application
const app = express();

// Apply helmet middleware for security headers
app.use(helmet());

// Configure CORS middleware with hardcoded origins plus environment variable
const allowedOrigins = [
  'http://localhost:3000',
  'https://e-classify-frontend.vercel.app',
  'http://e-classify-frontend.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Add body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Mount API routes under /api prefix
app.use('/api', routes);

// Apply error handler middleware as last middleware
app.use(errorHandler);

// Export Express app instance
export default app;
