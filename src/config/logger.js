import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

const LOG_LEVEL = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');
const LOG_TO_FILE = process.env.LOG_TO_FILE !== 'false';
const LOG_DIR = process.env.LOG_DIR || './logs';
const LOG_TO_CONSOLE = process.env.LOG_TO_CONSOLE !== 'false';
const LOG_COLORIZE = process.env.LOG_COLORIZE !== 'false';

const parseSize = (sizeStr) => {
  const match = sizeStr?.match(/^(\d+)(k|m|g)?$/i);
  if (!match) return 10 * 1024 * 1024;
  const num = parseInt(match[1]);
  const unit = (match[2] || 'm').toLowerCase();
  const multipliers = { k: 1024, m: 1024 * 1024, g: 1024 * 1024 * 1024 };
  return num * multipliers[unit];
};

const LOG_MAX_SIZE = parseSize(process.env.LOG_MAX_SIZE || '10m');
const LOG_MAX_FILES = parseInt(process.env.LOG_MAX_FILES || '14');

const logDir = path.resolve(LOG_DIR);
if (LOG_TO_FILE && !existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
  mkdirSync(path.join(logDir, 'app'), { recursive: true });
  mkdirSync(path.join(logDir, 'scoring'), { recursive: true });
}

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, component, requestId, ...meta }) => {
    let log = `[${timestamp}] [${level}]`;
    if (component) log += ` [${component}]`;
    if (requestId) log += ` [${requestId}]`;
    log += `: ${message}`;
    
    const metaKeys = Object.keys(meta).filter(k => k !== 'timestamp' && k !== 'level' && k !== 'message');
    if (metaKeys.length > 0) {
      const metaObj = {};
      metaKeys.forEach(k => metaObj[k] = meta[k]);
      log += `\n  ${JSON.stringify(metaObj, null, 2).split('\n').join('\n  ')}`;
    }
    
    return log;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [];

if (LOG_TO_CONSOLE) {
  transports.push(
    new winston.transports.Console({
      format: LOG_COLORIZE 
        ? winston.format.combine(winston.format.colorize(), consoleFormat)
        : consoleFormat
    })
  );
}

if (LOG_TO_FILE) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'app', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: LOG_MAX_SIZE,
      maxFiles: LOG_MAX_FILES
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'app', 'combined.log'),
      format: fileFormat,
      maxsize: LOG_MAX_SIZE,
      maxFiles: LOG_MAX_FILES
    })
  );

  if (isDevelopment) {
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'app', 'debug.log'),
        level: 'debug',
        format: fileFormat,
        maxsize: LOG_MAX_SIZE,
        maxFiles: LOG_MAX_FILES
      })
    );
  }
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: fileFormat,
  transports,
  exitOnError: false,
  exceptionHandlers: LOG_TO_FILE ? [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: LOG_MAX_SIZE,
      maxFiles: LOG_MAX_FILES
    })
  ] : [],
  rejectionHandlers: LOG_TO_FILE ? [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: LOG_MAX_SIZE,
      maxFiles: LOG_MAX_FILES
    })
  ] : []
});

if (transports.length === 0) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        consoleFormat
      )
    })
  );
}

export default logger;
export { LOG_LEVEL, LOG_TO_FILE, LOG_DIR, LOG_MAX_SIZE, LOG_MAX_FILES, LOG_TO_CONSOLE, LOG_COLORIZE };
