import { Model, Document, Types } from 'mongoose';
import { logger } from '../utils/logger';
import { AuthRequest, RequestHandler, Response, NextFunction } from '../@types/express';

interface ExtendedRequest extends AuthRequest {
  resource?: Document & {
    user?: string | Types.ObjectId | { _id: string | Types.ObjectId };
  };
}

// Combined request type
type AuthenticatedRequest = AuthRequest & ExtendedRequest;

export type Role = 'member' | 'staff' | 'admin';

// Role check helper function
const checkRole = (requiredRole: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role === requiredRole) {
      next();
      return;
    }

    logger.warn(`Unauthorized access attempt: not ${requiredRole}`);
    res.status(403).json({ 
      message: `Forbidden: ${requiredRole} role required` 
    });
  };
};

// Role-based middleware
export const isAdmin = checkRole('admin');
export const isStaff = checkRole('staff');

// Ownership middleware
interface ResourceWithUser extends Document {
  user?: string | Types.ObjectId | { _id: string | Types.ObjectId };
}

export const isOwner = <T extends ResourceWithUser>(
  model: Model<T>,
  paramName = 'id',
  userField = 'user'
): RequestHandler => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resourceId = req.params[paramName];
      if (!resourceId) {
        res.status(400).json({ message: 'Missing resource ID' });
        return;
      }

      const resource = await model.findById(resourceId);
      if (!resource) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }

      const resourceUser = resource[userField as keyof T];

      let resourceUserId: string | undefined;
      if (typeof resourceUser === 'string') resourceUserId = resourceUser;
      else if (resourceUser instanceof Types.ObjectId)
        resourceUserId = resourceUser.toString();
      else if (resourceUser && typeof resourceUser === 'object') {
        const userObj = resourceUser as { _id?: string | Types.ObjectId };
        if (userObj._id)
          resourceUserId =
            typeof userObj._id === 'string'
              ? userObj._id
              : userObj._id.toString();
      }

      const userId = req.user?._id;
      const userIdString =
        userId && typeof userId !== 'string' ? userId.toString() : userId;

      if (resourceUserId && userIdString && resourceUserId === userIdString) {
        req.resource = resource as Document & {
          user?: string | Types.ObjectId | { _id: string | Types.ObjectId };
        };
        next();
        return;
      }

      logger.warn('Unauthorized access attempt: not owner');
      res.status(401).json({ message: 'Unauthorized: Not the owner' });
    } catch (err) {
      logger.error('Error in ownership check', err instanceof Error ? err : { error: err });
      res.status(500).json({ message: 'Server error' });
    }
  };
};