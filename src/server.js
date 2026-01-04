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

// Track server start time
const SERVER_START_TIME = Date.now();

const getUptime = () => {
  const uptimeMs = Date.now() - SERVER_START_TIME;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  
  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: uptimeSeconds,
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    startTime: new Date(SERVER_START_TIME).toISOString()
  };
};

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
    app.set('getUptime', getUptime);

    // Set socket IO in notification service for real-time updates
    userNotificationService.setSocketIO(io);
    
    // Initialize cron jobs
    chatJobs.initialize(app);
    
    // Start HTTP server on configured port
    server.listen(PORT, () => {
      // Determine URLs based on environment
      const isProduction = NODE_ENV === 'production';
      const protocol = isProduction ? 'https' : 'http';
      const wsProtocol = isProduction ? 'wss' : 'ws';
      const domain = process.env.BACKEND_URL || `localhost:${PORT}`;
      const httpUrl = isProduction ? `${protocol}://${domain}` : `${protocol}://localhost:${PORT}`;
      const socketUrl = isProduction ? `${wsProtocol}://${domain}` : `${wsProtocol}://localhost:${PORT}`;
      
      logger.info(SUCCESS_MESSAGES.SERVER_STARTED);
      logger.info(`Server running on ${httpUrl}`);
      logger.info(`Socket.IO available at ${socketUrl}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Server started at: ${new Date(SERVER_START_TIME).toISOString()}`);
      
      console.log(`\n✅ Server started successfully!`);
      console.log(`� HTTP tServer: ${httpUrl}`);
      console.log(`🔌 Socket.IO: ${socketUrl}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`⏰ Started at: ${new Date(SERVER_START_TIME).toLocaleString()}\n`);
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
