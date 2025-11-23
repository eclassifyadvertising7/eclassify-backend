import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import logger from '#config/logger.js';

// Load environment variables
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

/**
 * Parse DATABASE_URL into connection components
 * @param {string} url - PostgreSQL connection URL
 * @returns {object} Parsed connection details
 */
const parseDatabaseUrl = (url) => {
  if (!url) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  try {
    const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const match = url.match(urlPattern);

    if (!match) {
      throw new Error('Invalid DATABASE_URL format. Expected: postgresql://username:password@host:port/database');
    }

    return {
      username: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4], 10),
      database: match[5]
    };
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', { error: error.message });
    throw error;
  }
};

/**
 * Database configuration for different environments
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */
const databaseConfig = {
  development: {
    url: DATABASE_URL,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg), // Enable logging in development (Req 9.5)
    pool: {
      max: 20,        // Maximum 20 connections (Req 9.2)
      min: 5,         // Minimum 5 connections (Req 9.2)
      acquire: 30000, // 30 seconds acquire timeout (Req 9.3)
      idle: 10000     // 10 seconds idle timeout (Req 9.4)
    },
    dialectOptions: {
      ssl: false
    }
  },
  production: {
    url: DATABASE_URL,
    dialect: 'postgres',
    logging: false, // Disable logging in production (Req 9.6)
    pool: {
      max: 20,        // Maximum 20 connections (Req 9.2)
      min: 5,         // Minimum 5 connections (Req 9.2)
      acquire: 30000, // 30 seconds acquire timeout (Req 9.3)
      idle: 10000     // 10 seconds idle timeout (Req 9.4)
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    url: TEST_DATABASE_URL || DATABASE_URL,
    dialect: 'postgres',
    logging: false, // Disable logging in test (Req 9.6)
    pool: {
      max: 20,        // Maximum 20 connections (Req 9.2)
      min: 5,         // Minimum 5 connections (Req 9.2)
      acquire: 30000, // 30 seconds acquire timeout (Req 9.3)
      idle: 10000     // 10 seconds idle timeout (Req 9.4)
    },
    dialectOptions: {
      ssl: false
    }
  }
};

// Get current environment configuration
const currentEnv = NODE_ENV;
const envConfig = databaseConfig[currentEnv];

// Parse DATABASE_URL (Req 9.1)
const dbConnectionDetails = parseDatabaseUrl(envConfig.url);

// Initialize Sequelize instance with PostgreSQL dialect (Req 9.7)
const sequelize = new Sequelize(envConfig.url, {
  dialect: envConfig.dialect,
  logging: envConfig.logging,
  pool: envConfig.pool,
  dialectOptions: envConfig.dialectOptions,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

/**
 * Test database connection with retry logic and exponential backoff
 * Requirements: 9.8 - Implement retry logic with exponential backoff
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
export const testConnection = async (maxRetries = 3, initialDelay = 1000) => {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully', {
        environment: NODE_ENV,
        host: dbConnectionDetails.host,
        port: dbConnectionDetails.port,
        database: dbConnectionDetails.database,
        attempt: attempt + 1
      });
      return true;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        logger.error('Failed to connect to database after maximum retries', {
          error: error.message,
          attempts: maxRetries,
          host: dbConnectionDetails.host,
          port: dbConnectionDetails.port,
          database: dbConnectionDetails.database
        });
        return false;
      }

      // Exponential backoff: delay doubles with each retry (Req 9.8)
      logger.warn(`Database connection attempt ${attempt} failed. Retrying in ${delay}ms...`, {
        error: error.message,
        nextDelay: delay * 2
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  return false;
};

/**
 * Close database connection gracefully
 * @returns {Promise<void>}
 */
export const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed successfully');
  } catch (error) {
    logger.error('Error closing database connection:', { error: error.message });
    throw error;
  }
};

// Export configuration and sequelize instance
export { databaseConfig, sequelize, Sequelize };
export default sequelize;
