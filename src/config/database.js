import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import logger from '#config/logger.js';

// Load environment variables
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

/**
 * Database configuration for different environments
 */
const databaseConfig = {
  development: {
    url: DATABASE_URL,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: false
    }
  },
  production: {
    url: DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Get current environment configuration
const envConfig = databaseConfig[NODE_ENV] || databaseConfig.development;

// Initialize Sequelize instance
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
        databaseUrl: DATABASE_URL,
        attempt: attempt + 1
      });
      return true;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        logger.error('Failed to connect to database after maximum retries', {
          error: error.message,
          attempts: maxRetries,
          databaseUrl: DATABASE_URL
        });
        return false;
      }

      logger.warn(`Database connection attempt ${attempt} failed. Retrying in ${delay}ms...`, {
        error: error.message,
        nextDelay: delay * 2
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
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
