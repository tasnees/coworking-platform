/* eslint-disable @typescript-eslint/no-namespace */
import { Model, Document, Types } from 'mongoose';
import { logger } from '../utils/logger';
import { Request as ExpressRequest, Response, NextFunction, ParamsDictionary } from 'express-serve-static-core';

// Define Role type
export type Role = 'MEMBER' | 'STAFF' | 'ADMIN';

// Define IUserDocument interface
export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  role: Role;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      id: string;
      role: Role;
      [key: string]: unknown;
    }
  }
}

// Define our custom request type that includes the extended properties
export interface CustomRequest extends ExpressRequest<ParamsDictionary> {
  user?: IUserDocument;
  resource?: Document & {
    user?: string | Types.ObjectId | { _id: string | Types.ObjectId };
    [key: string]: unknown;
  };
  isAdmin?: boolean;
  params: ParamsDictionary;
  [key: string]: unknown;
}

type ResourceWithUser = Document & {
  user?: string | Types.ObjectId | { _id: string | Types.ObjectId };
  [key: string]: unknown;
  get: <T = unknown>(field: string) => T;
};

type ExpressRequestHandler = (req: CustomRequest, res: Response, next: NextFunction) => void | Promise<void>;

// Role check helper function with proper typing
const checkRole = (requiredRole: Role) => {
  return (req: CustomRequest, _res: Response, next: NextFunction): void => {
    if (req.user?.role === requiredRole) {
      next();
      return;
    }

    logger.warn(`Unauthorized access attempt: not ${requiredRole}`);
    const error = new Error(`Forbidden: ${requiredRole} role required`);
    error.name = 'ForbiddenError';
    next(error);
  };
};

// Role-based middleware
export const isAdmin = checkRole('ADMIN');
export const isStaff = checkRole('STAFF');
export const isMember = checkRole('MEMBER');

// Ownership middleware with proper typing
export const isOwner = <T extends ResourceWithUser>(
  model: Model<T>,
  paramName = 'id',
  userField = 'user'
): ExpressRequestHandler => {
  return async (
    req: CustomRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resourceId = req.params[paramName];
      if (!resourceId) {
        throw new Error('Missing resource ID');
      }

      const resource = await model.findById(resourceId).exec();
      if (!resource) {
        throw new Error('Resource not found');
      }

      const resourceUser = resource.get(userField);
      let resourceUserId: string | undefined;
      
      if (!resourceUser) {
        throw new Error('Resource user not found');
      }

      if (typeof resourceUser === 'string') {
        resourceUserId = resourceUser;
      } else if (resourceUser && typeof resourceUser === 'object' && '_id' in resourceUser) {
        const id = resourceUser._id;
        resourceUserId = id instanceof Types.ObjectId ? id.toString() : String(id);
      } else if (resourceUser && typeof resourceUser.toString === 'function') {
        const idStr = resourceUser.toString();
        if (Types.ObjectId.isValid(idStr)) {
          resourceUserId = idStr;
        }
      }

      const userId = req.user?._id;
      const userIdString =
        userId && typeof userId !== 'string' ? userId.toString() : userId;

      if (!resourceUserId || !userIdString || resourceUserId !== userIdString) {
        logger.warn('Unauthorized access attempt: not owner');
        throw new Error('Unauthorized: Not the owner');
      }

      req.resource = resource as unknown as (Document & {
        user?: string | Types.ObjectId | { _id: string | Types.ObjectId };
        [key: string]: unknown;
      });
      next();
    } catch (err) {
      const error = err as Error;
      logger.error('Error in ownership check', { error: error.message });
      next(error);
    }
  };
};