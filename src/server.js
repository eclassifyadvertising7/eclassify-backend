import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app.js';
import logger from '#config/logger.js';
import { testConnection } from '#config/database.js';
import { initializeSocket } from './socket/index.js';
import chatJobs from './jobs/chatJobs.js';
import userNotificationService from '#services/userNotificationService.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '#utils/constants/messages.js';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the HTTP server
 */
const startServer = async () => {
  try {
    // Test database connection on startup
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error(ERROR_MESSAGES.DB_CONNECTION_FAILED);
      process.exit(1);
    }
    
    logger.info(SUCCESS_MESSAGES.DB_CONNECTED);
    
    // Create HTTP server
    const server = createServer(app);
    
    // Initialize Socket.io
    const { io, chatHandler, unreadCountHandler } = initializeSocket(server);
    
    // Make io and handlers available globally
    app.set('io', io);
    app.set('chatHandler', chatHandler);
    app.set('unreadCountHandler', unreadCountHandler);

    // Set socket IO in notification service for real-time updates
    userNotificationService.setSocketIO(io);
    
    // Initialize cron jobs
    chatJobs.initialize(app);
    
    // Start HTTP server on configured port
    server.listen(PORT, () => {
      logger.info(SUCCESS_MESSAGES.SERVER_STARTED);
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
    });
    
    // Graceful shutdown handler for SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      chatJobs.stopAll();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
    
    // Graceful shutdown handler for SIGINT
    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      chatJobs.stopAll();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Start the server
startServer();
