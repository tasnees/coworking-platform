import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to handle 404 Not Found errors
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'The requested resource was not found',
    error: {
      code: 'NOT_FOUND',
      details: `The route ${req.originalUrl} does not exist on this server`,
    },
    request: {
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
};

export { notFoundHandler };
