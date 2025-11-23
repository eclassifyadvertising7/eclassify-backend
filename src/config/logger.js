import winston from 'winston';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

/**
 * Winston Logger Configuration
 * 
 * Development: Console output with colorized format
 * Production: File output with rotation (error.log, combined.log)
 */

// Define log format with timestamp and level
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] [${level}]: ${message}\n${stack}`;
    }
    return `[${timestamp}] [${level}]: ${message}`;
  })
);

// Configure transports based on environment
const transports = [];

// Console transport for development with colorized output
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  );
}

// File transports for production with rotation
if (isProduction) {
  // Error log - only error level
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Combined log - all levels
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Add console transport for production if no other transports are configured
if (transports.length === 0) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  );
}

export default logger;
