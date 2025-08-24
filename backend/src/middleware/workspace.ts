import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from './auth';
import { logger } from '../utils/logger';
import { WorkspaceModel, IWorkspace } from '../models/Workspace';

// Role-based permissions
type WorkspacePermission =
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
    'view_members',
    'manage_amenities',
    'view_analytics',
    'view_all',
  ],
  member: [
    'view_workspace',
    'create_bookings',
    'view_amenities',
    'view_own',
  ],
};

type WorkspaceRole = 'admin' | 'staff' | 'member';

interface WorkspaceUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
}

interface WorkspaceMember {
  _id: Types.ObjectId;
  role: WorkspaceRole;
  user: WorkspaceUser;
}

interface WorkspaceRequest extends AuthRequest {
  workspace?: IWorkspace & {
    isPublic?: boolean;
    owner: {
      _id: Types.ObjectId;
      email: string;
      name: string;
    };
    staffMembers: WorkspaceMember[];
    admins: WorkspaceMember[];
    members: WorkspaceMember[];
    roles: Record<string, WorkspaceRole>;  // Map user IDs to their roles
  };
}

/**
 * Middleware to validate and attach workspace to request
 * This is a base middleware that other workspace middlewares will use
 */
const attachWorkspace = async (
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const workspaceId = req.params.id;

    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_WORKSPACE_ID',
        message: 'Invalid workspace ID provided.'
      });
    }

    const workspaceData = await WorkspaceModel.findById(workspaceId)
      .populate('owner', '_id name email')
      .populate({
        path: 'members',
        populate: {
          path: 'user',
          select: '_id name email'
        }
      })
      .populate({
        path: 'staffMembers',
        populate: {
          path: 'user',
          select: '_id name email'
        }
      })
      .populate({
        path: 'admins',
        populate: {
          path: 'user',
          select: '_id name email'
        }
      })
      .lean();

    if (!workspaceData) {
      return res.status(404).json({
        success: false,
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found.'
      });
    }

    // Build the roles map and ensure proper typing
    const roles: Record<string, WorkspaceRole> = {};
    const workspace = workspaceData as unknown as IWorkspace & {
      owner: { _id: Types.ObjectId; name: string; email: string };
      members: WorkspaceMember[];
      staffMembers: WorkspaceMember[];
      admins: WorkspaceMember[];
    };

    // Map all member roles
    workspace.members.forEach((member: WorkspaceMember) => {
      if (member.user._id) {
        roles[member.user._id.toString()] = 'member';
      }
    });

    // Map all staff roles
    workspace.staffMembers.forEach((staff: WorkspaceMember) => {
      if (staff.user._id) {
        roles[staff.user._id.toString()] = 'staff';
      }
    });

    // Map all admin roles
    workspace.admins.forEach((admin: WorkspaceMember) => {
      if (admin.user._id) {
        roles[admin.user._id.toString()] = 'admin';
      }
    });

    // Owner is always admin
    roles[workspace.owner._id.toString()] = 'admin';

    req.workspace = {
      ...workspace,
      roles,
    };
    next();
  } catch (error) {
    logger.error('Workspace validation error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error validating workspace.'
    });
  }
};

/**
 * Middleware to check if user is a workspace member
 */
export const isWorkspaceMember = async (
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    // First attach the workspace to the request
    await attachWorkspace(req, res, async () => {
      const workspace = req.workspace;
      const userId = req.user!.id;

      if (!workspace) {
        return res.status(404).json({
          success: false,
          code: 'WORKSPACE_NOT_FOUND',
          message: 'Workspace not found.'
        });
      }

      const isMember = workspace.members.some(
        (member: { _id: Types.ObjectId }) => member._id.toString() === userId
      );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          code: 'NOT_WORKSPACE_MEMBER',
          message: 'You must be a member of this workspace to perform this action.'
        });
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace member check error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error checking workspace membership.'
    });
  }
};

/**
 * Middleware to check if user is a workspace admin
 */
export const isWorkspaceAdmin = async (
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    // First attach the workspace to the request
    await attachWorkspace(req, res, async () => {
      const workspace = req.workspace;
      const userId = req.user!.id;

      if (!workspace) {
        return res.status(404).json({
          success: false,
          code: 'WORKSPACE_NOT_FOUND',
          message: 'Workspace not found.'
        });
      }

      const isAdmin = workspace.admins.some(
        (admin: { _id: Types.ObjectId }) => admin._id.toString() === userId
      );

      if (!isAdmin && workspace.owner._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          code: 'NOT_WORKSPACE_ADMIN',
          message: 'You must be an admin of this workspace to perform this action.'
        });
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace admin check error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error checking workspace admin status.'
    });
  }
};

/**
 * Middleware to check if user is the workspace owner
 */
export const isWorkspaceOwner = async (
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    // First attach the workspace to the request
    await attachWorkspace(req, res, async () => {
      const workspace = req.workspace;
      const userId = req.user!.id;

      if (!workspace) {
        return res.status(404).json({
          success: false,
          code: 'WORKSPACE_NOT_FOUND',
          message: 'Workspace not found.'
        });
      }

      if (workspace.owner._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          code: 'NOT_WORKSPACE_OWNER',
          message: 'You must be the owner of this workspace to perform this action.'
        });
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace owner check error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error checking workspace ownership.'
    });
  }
};

/**
 * Middleware to check if a workspace is public
 */
export const isWorkspacePublic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // First attach the workspace to the request
    await attachWorkspace(req as WorkspaceRequest, res, async () => {
      const workspace = (req as WorkspaceRequest).workspace;

      if (!workspace) {
        return res.status(404).json({
          success: false,
          code: 'WORKSPACE_NOT_FOUND',
          message: 'Workspace not found.'
        });
      }

      if (!workspace.isPublic) {
        return res.status(403).json({
          success: false,
          code: 'WORKSPACE_NOT_PUBLIC',
          message: 'This workspace is not public.'
        });
      }

      next();
    });
  } catch (error) {
    logger.error('Workspace public check error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error checking workspace visibility.'
    });
  }
};

/**
 * Check if a user has a specific permission in the workspace
 */
const hasPermission = (
  workspace: WorkspaceRequest['workspace'],
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
  return async (
    req: WorkspaceRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Authentication required.'
        });
      }

      await attachWorkspace(req, res, () => {
        const workspace = req.workspace;
        const userId = req.user!.id;

        if (!workspace) {
          return res.status(404).json({
            success: false,
            code: 'WORKSPACE_NOT_FOUND',
            message: 'Workspace not found.'
          });
        }

        if (!hasPermission(workspace, userId, permission)) {
          return res.status(403).json({
            success: false,
            code: 'PERMISSION_DENIED',
            message: `You don't have permission to ${permission.replace(/_/g, ' ').toLowerCase()}`
          });
        }

        next();
      });
    } catch (error) {
      logger.error('Workspace permission check error:', error);
      return res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Error checking workspace permissions.'
      });
    }
  };
};
