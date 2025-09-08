import winston from 'winston';

// Create a simple logger with minimal configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

// HTTP request logger
const httpLogger = (message: string): void => {
  logger.info(message.trim());
};

export { logger, httpLogger };
export default logger;
