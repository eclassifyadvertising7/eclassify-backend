/**
 * Socket.io Setup
 * Initializes Socket.io and registers handlers
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import ChatHandler from './chatHandler.js';
import logger from '#config/logger.js';

/**
 * Initialize Socket.io
 * @param {Object} server - HTTP server instance
 * @returns {Object} - Socket.io instance
 */
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to socket
      socket.userId = decoded.userId;
      socket.roleId = decoded.roleId;
      socket.roleSlug = decoded.roleSlug;

      logger.info(`Socket authenticated for user ${decoded.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid authentication token'));
    }
  });

  // Initialize chat handler
  const chatHandler = new ChatHandler(io);

  // Handle connections
  io.on('connection', (socket) => {
    chatHandler.handleConnection(socket);
  });

  logger.info('Socket.io initialized successfully');

  return { io, chatHandler };
};

export default initializeSocket;
