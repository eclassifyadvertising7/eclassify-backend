import winston from 'winston';
import path from 'path';
import { LOG_TO_FILE, LOG_DIR, LOG_MAX_SIZE, LOG_MAX_FILES, LOG_TO_CONSOLE, LOG_COLORIZE, LOG_LEVEL } from '#config/logger.js';

const isDevelopment = process.env.NODE_ENV === 'development';

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    let log = `[${timestamp}] [${level}] [SCORING]`;
    if (requestId) log += ` [${requestId}]`;
    log += `: ${message}`;
    
    const metaKeys = Object.keys(meta).filter(k => 
      k !== 'timestamp' && k !== 'level' && k !== 'message' && k !== 'component'
    );
    
    if (metaKeys.length > 0) {
      const metaObj = {};
      metaKeys.forEach(k => metaObj[k] = meta[k]);
      const metaStr = Object.entries(metaObj)
        .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' ');
      log += ` | ${metaStr}`;
    }
    
    return log;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
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
  const scoringLogDir = path.join(LOG_DIR, 'scoring');
  
  transports.push(
    new winston.transports.File({
      filename: path.join(scoringLogDir, 'scoring.log'),
      format: fileFormat,
      maxsize: LOG_MAX_SIZE,
      maxFiles: LOG_MAX_FILES
    })
  );

  if (isDevelopment) {
    transports.push(
      new winston.transports.File({
        filename: path.join(scoringLogDir, 'scoring-debug.log'),
        level: 'debug',
        format: fileFormat,
        maxsize: LOG_MAX_SIZE,
        maxFiles: LOG_MAX_FILES
      })
    );
  }
}

const scoringLogger = winston.createLogger({
  level: LOG_LEVEL,
  format: fileFormat,
  transports,
  defaultMeta: { component: 'Scoring' }
});

scoringLogger.startTimer = () => {
  const start = Date.now();
  
  return {
    done: (meta = {}) => {
      const duration = Date.now() - start;
      scoringLogger.debug(meta.message || 'Operation completed', {
        ...meta,
        duration: `${duration}ms`
      });
    }
  };
};

scoringLogger.searchInitiated = (requestId, data) => {
  scoringLogger.info('Search initiated', {
    requestId,
    ...data
  });
};

scoringLogger.searchMethodSelected = (requestId, data) => {
  scoringLogger.info('Search method selected', {
    requestId,
    ...data
  });
};

scoringLogger.searchCompleted = (requestId, data) => {
  scoringLogger.info('Search completed', {
    requestId,
    ...data
  });
};

scoringLogger.fallbackAttempt = (requestId, data) => {
  scoringLogger.debug('Fallback attempt', {
    requestId,
    ...data
  });
};

scoringLogger.fallbackResult = (requestId, data) => {
  scoringLogger.debug('Fallback result', {
    requestId,
    ...data
  });
};

scoringLogger.fallbackCompleted = (requestId, data) => {
  scoringLogger.info('Fallback completed', {
    requestId,
    ...data
  });
};

scoringLogger.queryExecuted = (requestId, data) => {
  scoringLogger.debug('Query executed', {
    requestId,
    ...data
  });
};

scoringLogger.listingScored = (requestId, data) => {
  scoringLogger.debug('Listing scored', {
    requestId,
    ...data
  });
};

scoringLogger.sortingApplied = (requestId, data) => {
  scoringLogger.debug('Sorting applied', {
    requestId,
    ...data
  });
};

scoringLogger.locationParsed = (requestId, data) => {
  scoringLogger.debug('Location parsed', {
    requestId,
    ...data
  });
};

scoringLogger.locationMatched = (requestId, data) => {
  scoringLogger.debug('Location matched to database', {
    requestId,
    ...data
  });
};

scoringLogger.distanceCalculated = (requestId, data) => {
  scoringLogger.debug('Distance calculated', {
    requestId,
    ...data
  });
};

export default scoringLogger;
