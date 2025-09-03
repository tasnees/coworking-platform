import { Request, Response } from 'express';
import { Types, Document } from 'mongoose';
import { logger } from '../utils/logger';
import Workspace, { IWorkspace } from '../models/Workspace';

// Define custom types
export type WorkspaceRole = 'admin' | 'staff' | 'member';

export type WorkspacePermission =
  | 'manage_members'
  | 'manage_staff'
  | 'manage_workspace'
  | 'delete_workspace'
  | 'view_analytics'
  | 'manage_bookings'
  | 'manage_amenities'
  | 'view_all'
  | 'view_members'
  | 'view_workspace'
  | 'create_bookings'
  | 'view_amenities'
  | 'view_own';

export interface WorkspaceUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
}

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface WorkspaceMember {
  _id: Types.ObjectId;
  role: WorkspaceRole;
  user: WorkspaceUser | Types.ObjectId;
}

export type WorkspaceType = 'desk' | 'meeting_room' | 'private_office' | 'event_space';

export interface IWorkspaceExtended extends Omit<IWorkspace, 'owner' | 'staffMembers' | 'admins' | 'members' | 'location' | 'type'> {
  isPublic?: boolean;
  roles: Record<string, WorkspaceRole>;
  owner: WorkspaceUser | Types.ObjectId;
  staffMembers: WorkspaceMember[];
  admins: WorkspaceMember[];
  members: WorkspaceMember[];
  location?: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  type?: WorkspaceType;
}

// Create a custom request interface that extends properly
interface WorkspaceMiddlewareRequest extends Request {
  user?: IUserDocument;
  workspace?: IWorkspaceExtended;
  params: {
    id?: string;
    [key: string]: string | undefined;
  };
}

export interface WorkspaceRequest extends WorkspaceMiddlewareRequest {
  workspace: IWorkspaceExtended;
  user: IUserDocument;
}

// Define ApiResponse interface for proper typing
interface ApiResponseMethods {
  unauthorized: (res: Response, message: string) => void;
  notFound: (res: Response, message: string) => void;
  forbidden: (res: Response, message: string) => void;
  internalError: (res: Response, message: string) => void;
}

// Import ApiResponse and cast it properly
import { ApiResponse as ApiResponseClass } from '../utils/apiResponse';
const ApiResponse = ApiResponseClass as unknown as ApiResponseMethods;

const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, WorkspacePermission[]> = {
  admin: [
    'manage_members',
    'manage_staff',
    'manage_workspace',
    'delete_workspace',
    'view_analytics',
    'manage_bookings',
    'manage_amenities',
    'view_all',
  ],
  staff: [
    'manage_bookings',
    'view_analytics',
    'manage_amenities',
  ],
  member: [
    'view_workspace',
    'create_bookings',
    'view_amenities',
  ],
};

/**
 * Middleware to validate and attach workspace to request
 */
const attachWorkspace = async (req: WorkspaceMiddlewareRequest, res: Response, next: () => void): Promise<void> => {
  try {
    const workspaceId = req.params.id;

    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    const workspaceData = await Workspace.findById(workspaceId)
      .populate('owner', '_id name email')
      .populate({
        path: 'members',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .populate({
        path: 'staffMembers',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .populate({
        path: 'admins',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .lean() as unknown as IWorkspaceExtended;

    if (!workspaceData) {
      ApiResponse.notFound(res, 'Workspace not found');
      return;
    }

    // Build the roles map
    const roles: Record<string, WorkspaceRole> = {};
    const workspace = workspaceData;

    // Map all member roles
    if (workspace.members) {
      workspace.members.forEach((member: WorkspaceMember) => {
        if (member.user && typeof member.user === 'object' && '_id' in member.user) {
          const userId = (member.user._id as Types.ObjectId).toString();
          if (userId) {
            roles[userId] = 'member';
          }
        }
      });
    }

    // Map all staff roles
    if (workspace.staffMembers) {
      workspace.staffMembers.forEach((staff: WorkspaceMember) => {
        if (staff.user && typeof staff.user === 'object' && '_id' in staff.user) {
          const userId = (staff.user._id as Types.ObjectId).toString();
          if (userId) {
            roles[userId] = 'staff';
          }
        }
      });
    }

    // Map all admin roles
    if (workspace.admins) {
      workspace.admins.forEach((admin: WorkspaceMember) => {
        if (admin.user && typeof admin.user === 'object' && '_id' in admin.user) {
          const userId = (admin.user._id as Types.ObjectId).toString();
          if (userId) {
            roles[userId] = 'admin';
          }
        }
      });
    }

    // Map owner as admin
    if (workspace.owner && typeof workspace.owner === 'object' && '_id' in workspace.owner) {
      const ownerId = (workspace.owner._id as Types.ObjectId).toString();
      if (ownerId) {
        roles[ownerId] = 'admin';
      }
    }

    // Create workspace with roles
    const workspaceWithRoles: IWorkspaceExtended = {
      ...workspace,
      roles,
      staffMembers: workspace.staffMembers || [],
      admins: workspace.admins || [],
      members: workspace.members || []
    };
    
    req.workspace = workspaceWithRoles;
    next();
  } catch (error) {
    logger.error('Workspace validation error:', error);
    ApiResponse.internalError(res, 'Error validating workspace');
  }
};

/**
 * Middleware to check if user is a workspace member
 */
export const isWorkspaceMember = async (req: WorkspaceMiddlewareRequest, res: Response, next: () => void): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    await attachWorkspace(req, res, () => {
      const workspace = req.workspace;
      const userId = req.user?._id?.toString() || req.user?.id;

      if (!workspace) {
        ApiResponse.notFound(res, 'Workspace not found');
        return;
      }

      const isMember = workspace.members.some(
        (member: WorkspaceMember) => {
          if (typeof member.user === 'object' && '_id' in member.user) {
            return (member.user._id as Types.ObjectId).toString() === userId;
          }
          return (member.user as Types.ObjectId).toString() === userId;
        }
      );

      if (!isMember) {
        ApiResponse.forbidden(res, 'You must be a member of this workspace to perform this action.');
        return;
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace member check error:', error);
    ApiResponse.internalError(res, 'Error checking workspace membership');
  }
};

/**
 * Middleware to check if user is a workspace admin
 */
export const isWorkspaceAdmin = async (req: WorkspaceMiddlewareRequest, res: Response, next: () => void): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    await attachWorkspace(req, res, () => {
      const workspace = req.workspace;
      const userId = req.user?._id?.toString() || req.user?.id;

      if (!workspace) {
        ApiResponse.notFound(res, 'Workspace not found');
        return;
      }

      const isAdmin = workspace.admins.some(
        (admin: WorkspaceMember) => {
          if (typeof admin.user === 'object' && '_id' in admin.user) {
            return (admin.user._id as Types.ObjectId).toString() === userId;
          }
          return (admin.user as Types.ObjectId).toString() === userId;
        }
      );

      const isOwner = workspace.owner && typeof workspace.owner === 'object' && '_id' in workspace.owner 
        ? (workspace.owner._id as Types.ObjectId).toString() === userId
        : (workspace.owner as Types.ObjectId)?.toString() === userId;

      if (!isAdmin && !isOwner) {
        ApiResponse.forbidden(res, 'You must be an admin of this workspace to perform this action.');
        return;
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace admin check error:', error);
    ApiResponse.internalError(res, 'Error checking workspace admin status');
  }
};

/**
 * Middleware to check if user is the workspace owner
 */
export const isWorkspaceOwner = async (req: WorkspaceMiddlewareRequest, res: Response, next: () => void): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    await attachWorkspace(req, res, () => {
      const workspace = req.workspace;
      const userId = req.user?._id?.toString() || req.user?.id;

      if (!workspace) {
        ApiResponse.notFound(res, 'Workspace not found');
        return;
      }

      const isOwner = workspace.owner && typeof workspace.owner === 'object' && '_id' in workspace.owner 
        ? (workspace.owner._id as Types.ObjectId).toString() === userId
        : (workspace.owner as Types.ObjectId)?.toString() === userId;

      if (!isOwner) {
        ApiResponse.forbidden(res, 'You must be the owner of this workspace to perform this action.');
        return;
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace owner check error:', error);
    ApiResponse.internalError(res, 'Error checking workspace ownership');
  }
};

/**
 * Middleware to check if a workspace is public
 */
export const isWorkspacePublic = async (req: WorkspaceMiddlewareRequest, res: Response, next: () => void): Promise<void> => {
  try {
    await attachWorkspace(req, res, () => {
      const workspace = req.workspace;

      if (!workspace) {
        ApiResponse.notFound(res, 'Workspace not found');
        return;
      }

      if (!workspace.isPublic) {
        ApiResponse.forbidden(res, 'This workspace is not public.');
        return;
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace public check error:', error);
    ApiResponse.internalError(res, 'Error checking workspace visibility');
  }
};

/**
 * Check if a user has a specific permission in the workspace
 */
const hasPermission = (
  workspace: IWorkspaceExtended,
  userId: string,
  permission: WorkspacePermission
): boolean => {
  if (!workspace || !userId) return false;

  const userRole = workspace.roles[userId];
  if (!userRole) return false;

  return WORKSPACE_PERMISSIONS[userRole].includes(permission);
};

/**
 * Middleware to check if user has specific permission
 */
export const hasWorkspacePermission = (permission: WorkspacePermission) => {
  return async (req: WorkspaceMiddlewareRequest, res: Response, next: () => void): Promise<void> => {
    try {
      if (!req.user || (!req.user._id && !req.user.id)) {
        ApiResponse.unauthorized(res, 'Authentication required');
        return;
      }

      await attachWorkspace(req, res, () => {
        const workspace = req.workspace;
        const userId = req.user?.id;

        if (!workspace) {
          ApiResponse.notFound(res, 'Workspace not found');
          return;
        }
        
        if (!userId) {
          ApiResponse.unauthorized(res, 'Invalid user ID');
          return;
        }

        const safeWorkspace = {
          ...workspace,
          roles: workspace.roles || {}
        };

        if (!hasPermission(safeWorkspace, userId, permission)) {
          ApiResponse.forbidden(res, `You don't have permission to ${permission.replace(/_/g, ' ').toLowerCase()}`);
          return;
        }

        next();
      });
    } catch (error) {
      logger.error('Workspace permission check error:', error);
      ApiResponse.internalError(res, 'Error checking workspace permissions');
    }
  };
};