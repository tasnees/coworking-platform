import winston from 'winston';

const { combine, timestamp, json, simple } = winston.format;

// Create a simple console logger
const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: simple()
    })
  ]
});

export { logger };
