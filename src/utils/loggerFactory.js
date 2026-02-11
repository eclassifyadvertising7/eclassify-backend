import logger from '#config/logger.js';

class LoggerFactory {
  static create(component, defaultMeta = {}) {
    return logger.child({
      component,
      ...defaultMeta
    });
  }

  static createWithTimer(component, defaultMeta = {}) {
    const childLogger = this.create(component, defaultMeta);
    
    childLogger.startTimer = () => {
      const start = Date.now();
      
      return {
        done: (meta = {}) => {
          const duration = Date.now() - start;
          childLogger.debug(meta.message || 'Operation completed', {
            ...meta,
            duration: `${duration}ms`
          });
        }
      };
    };
    
    return childLogger;
  }
}

export default LoggerFactory;
