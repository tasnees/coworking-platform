import * as winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'coworking-platform' },
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`
        )
      ),
    })
  ]
});

export { logger };
