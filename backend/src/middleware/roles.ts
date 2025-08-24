import { Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthRequest } from './auth';

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    logger.warn('Unauthorized access attempt - no user in request');
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`Forbidden access attempt - user ${req.user._id} is not an admin`);
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      message: 'Admin access required.'
    });
  }

  next();
};

/**
 * Middleware to check if user has manager role
 */
export const isManager = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin' ) {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      message: 'Manager or admin access required.'
    });
  }

  next();
};

/**
 * Middleware to check if user has a specific role
 * @param roles Array of allowed roles
 */
export const hasRole = (roles: string[]): ((req: AuthRequest, res: Response, next: NextFunction) => Response | void) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is the owner of the resource
 * @param model Mongoose model to check ownership against
 * @param paramName Name of the URL parameter containing the resource ID
 * @param userField Field in the model that references the user (default: 'user')
 */
import { Model, Document } from 'mongoose';

export const isOwner = (model: Model<Document>, paramName = 'id', userField = 'user'): ((req: AuthRequest, res: Response, next: NextFunction) => Promise<Response | void>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: 'Resource not found.'
        });
      }

      // Check if the resource has the user field
      if (!((resource as unknown) as Record<string, unknown>)[userField]) {
        return res.status(500).json({
          success: false,
          code: 'SERVER_ERROR',
          message: 'Invalid resource structure.'
        });
      }

      // Check if user is the owner
      const ownerId = ((resource as unknown) as Record<string, unknown>)[userField];
      const user = req.user as { _id: string | { toString(): string } };
      if (!ownerId || ownerId.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.'
        });
      }

      // Attach the resource to the request for later use
      (req as AuthRequest & { resource?: Document }).resource = resource;
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Error checking resource ownership.'
      });
    }
  };
};
