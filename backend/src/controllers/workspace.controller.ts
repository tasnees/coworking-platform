import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';
import { WorkspaceModel } from '../models/Workspace';
import { User } from '../models/User';
import BookingModel from '../models/Booking';
import { sendEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';
import Workspace from '../models/Workspace.new';

interface WorkspaceFilters {
  type?: string;
  capacity?: { $gte: number };
  amenities?: { $all: string[] };
  $or?: Array<{
    [key: string]: { $regex: string | undefined; $options: string };
  }>;
}

interface WorkspaceCreateInput {
  name: string;
  description: string;
  type: string;
  capacity: number;
  amenities: string[];
  location: {
    address: string;
    coordinates?: [number, number];
  };
}

interface WorkspaceUpdateInput extends Partial<WorkspaceCreateInput> {
  isActive?: boolean;
}
/**
 * @desc    Create a workspace
 * @route   POST /api/workspaces
 * @access  Private
 */
export const createWorkspace = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { name, description, type, capacity, amenities, location } = req.body;
    const userId = req.user?.id;


    // Create a new workspace
    const workspace = new WorkspaceModel({
      name,
      description,
      type,
      capacity,
      amenities,
      location,
      owner: userId
    });
    
    await workspace.save();
    
    // Add workspace to user's workspaces
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { workspaces: workspace._id }
      });
    }
    
    return res.status(201).json({
      success: true,
      data: workspace,
      message: 'Workspace created successfully.'
    });
  } catch (error) {
    logger.error('Create workspace error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error creating workspace.'
    });
  }
};

/**
 * @desc    Get workspaces
 * @route   GET /api/workspaces
 * @access  Private
 */
export const getWorkspaces = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter: WorkspaceFilters = {};
    
    // Apply filters based on query params
    if (req.query.type) filter.type = req.query.type as string;
    if (req.query.capacity) {
      const capacityValue = parseInt(req.query.capacity as string, 10);
      if (!isNaN(capacityValue)) {
        filter.capacity = { $gte: capacityValue };
      }
    }
    if (req.query.amenities) {
      const amenitiesList = (req.query.amenities as string).split(',').filter(Boolean);
      if (amenitiesList.length > 0) {
        filter.amenities = { $all: amenitiesList };
      }
    }
    
    // Search
    if (req.query.search) {
      const searchQuery = req.query.search as string;
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { 'location.address': { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const [workspaces, total] = await Promise.all([
      WorkspaceModel.find(filter)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkspaceModel.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      success: true,
      count: workspaces.length,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null
      },
      data: workspaces
    });
  } catch (error) {
    logger.error('Get workspaces error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error fetching workspaces.'
    });
  }
};

/**
 * @desc    Get single workspace by ID
 * @route   GET /api/workspaces/:id
 * @access  Private
 */
export const getWorkspace = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const workspaceId = req.params.id;
    const workspace = await WorkspaceModel.findById(workspaceId)
      .populate('owner', 'name email')
      .populate('admins', 'name email')
      .populate('members', 'name email');

    if (!workspace) {
      return res.status(404).json({
        success: false,
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: workspace
    });
  } catch (error) {
    logger.error('Get workspace error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error fetching workspace.'
    });
  }
};

/**
 * @desc    Update workspace
 * @route   PUT /api/workspaces/:id
 * @access  Private
 */
export const updateWorkspace = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { name, description, type, capacity, amenities, location, isActive } = req.body;
    const workspaceId = req.params.id;
    const userId = req.user?.id;

    // Input validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'User not authenticated.'
      });
    }

    // Check if workspace exists and user is admin/owner
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { admins: userId }
      ]
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found or you do not have permission to update it.'
      });
    }

    // Prepare update data
    const updateData: WorkspaceUpdateInput = {};
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (typeof capacity === 'number' && capacity > 0) updateData.capacity = capacity;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (location && location.address) updateData.location = location;
    
    // Handle amenities safely - merge existing with new ones if provided
    if (Array.isArray(amenities)) {
      updateData.amenities = [...new Set([...(workspace.get('amenities') || []), ...amenities])];
    }

    // Update the workspace
    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('admins', 'name email')
      .populate('members', 'name email');

    if (!updatedWorkspace) {
      return res.status(404).json({
        success: false,
        code: 'UPDATE_FAILED',
        message: 'Failed to update workspace.'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedWorkspace,
      message: 'Workspace updated successfully.'
    });
  } catch (error) {
    logger.error('Update workspace error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error updating workspace.'
    });
  }
};

/**
 * @desc    Delete workspace
 * @route   DELETE /api/workspaces/:id
 * @access  Private
 */
export const deleteWorkspace = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.id;

    // Check if workspace exists and user is owner
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      owner: userId
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found or you do not have permission to delete it.'
      });
    }

    // TODO: Add cleanup for related data (bookings, resources, etc.)
    
    // Use deleteOne instead of remove
    await WorkspaceModel.deleteOne({ _id: workspace._id });

    // Remove workspace from users' workspaces
    await User.updateMany(
      { workspaces: workspace._id },
      { $pull: { workspaces: workspace._id } }
    );

    res.status(200).json({
      success: true,
      data: {},
      message: 'Workspace deleted successfully.'
    });
  } catch (error) {
    logger.error('Delete workspace error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error deleting workspace.'
    });
  }
};

export const getWorkspaceMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const workspace = await WorkspaceModel.findById(id)
      .populate('members.user', 'name email avatar role')
      .populate('members.invitedBy', 'name email');

    if (!workspace) {
      return res.status(404).json({ 
        success: false,
        message: 'Workspace not found' 
      });
    }

    // Check if user has permission to view members
    // (optional - your isWorkspaceMember middleware might handle this)

    res.status(200).json({
      success: true,
      data: {
        members: workspace.members,
        totalMembers: workspace.members.length
      }
    });
  } catch (error) {
    console.error('Get workspace members error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving workspace members' 
    });
  }
};

/**
 * @desc    Add member to workspace
 * @route   POST /api/workspaces/:id/members
 * @access  Private
 */
export const addMember = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { userId, role } = req.body;
    const workspaceId = req.params.id;
    const currentUserId = req.user?.id;

    // Check if workspace exists and current user is admin/owner
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      $or: [
        { owner: currentUserId },
        { admins: currentUserId }
      ]
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found or you do not have permission to add members.'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }

    // Check if user is already a member
    if (workspace.members.some(memberId => memberId.toString() === userId)) {
      return res.status(400).json({
        success: false,
        code: 'MEMBER_EXISTS',
        message: 'User is already a member of this workspace.'
      });
    }

    // Add user to workspace
    workspace.members.push(userId);
    if (role === 'admin') {
      workspace.admins.push(userId);
    }
    await workspace.save();

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(userId, {
      $addToSet: { workspaces: workspaceId }
    });

    // Send invitation email
    const invitationUrl = `${process.env.CLIENT_URL}/workspaces/${workspaceId}`;
    await sendEmail({
      to: user.email,
      subject: `You've been added to ${workspace.name}`,
      template: 'workspace-invitation',
      context: {
        name: user.firstName || 'User',
        workspaceName: workspace.name,
        inviterName: (req.user as { firstName?: string })?.firstName || 'A user',
        invitationUrl
      }
    });

    res.status(200).json({
      success: true,
      data: workspace,
      message: 'Member added successfully.'
    });
  } catch (error) {
    logger.error('Add member error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error adding member to workspace.'
    });
  }
};

/**
 * @desc    Remove member from workspace
 * @route   DELETE /api/workspaces/:id/members/:userId
 * @access  Private
 */
export const removeMember = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { userId } = req.params;
    const workspaceId = req.params.id;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'User not authenticated.'
      });
    }

    // Check if workspace exists and current user is admin/owner
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      $or: [
        { owner: currentUserId },
        { admins: currentUserId }
      ]
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found or you do not have permission to remove members.'
      });
    }

    // Prevent removing the owner
    if (workspace.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        code: 'OWNER_REMOVAL',
        message: 'Cannot remove the workspace owner.'
      });
    }

    // Check if user is a member
    if (!workspace.members.some((memberId: Types.ObjectId) => memberId.toString() === userId)) {
      return res.status(400).json({
        success: false,
        code: 'NOT_A_MEMBER',
        message: 'User is not a member of this workspace.'
      });
    }

    // Remove user from workspace
    workspace.members = workspace.members.filter(
      (memberId: Types.ObjectId) => memberId.toString() !== userId
    );
    workspace.admins = workspace.admins.filter(
      (adminId: Types.ObjectId) => adminId.toString() !== userId
    );
    await workspace.save();

    // Remove workspace from user's workspaces
    await User.findByIdAndUpdate(userId, {
      $pull: { workspaces: workspaceId }
    });

    // Cancel user's upcoming bookings for this workspace
    const bookings = await BookingModel.find({
      workspace: workspaceId,
      user: userId,
      startDate: { $gt: new Date() }
    });
    await Promise.all(bookings.map((booking: { _id: Types.ObjectId }) => 
      BookingModel.findByIdAndDelete(booking._id)
    ));

    res.status(200).json({
      success: true,
      data: {},
      message: 'Member removed successfully.'
    });
  } catch (error) {
    logger.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error removing member from workspace.'
    });
  }
};

/**
 * @desc    Update member role
 * @route   PUT /api/workspaces/:id/members/:userId/role
 * @access  Private
 */
export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const workspaceId = req.params.id;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'User not authenticated.'
      });
    }

    // Check if workspace exists and current user is admin/owner
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      $or: [
        { owner: currentUserId },
        { admins: currentUserId }
      ]
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found or you do not have permission to update roles.'
      });
    }

    // Prevent modifying owner's role
    if (workspace.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        code: 'OWNER_ROLE',
        message: 'Cannot change the role of the workspace owner.'
      });
    }

    // Check if user is a member
    if (!workspace.members.some((memberId: Types.ObjectId) => memberId.toString() === userId)) {
      return res.status(400).json({
        success: false,
        code: 'NOT_A_MEMBER',
        message: 'User is not a member of this workspace.'
      });
    }

    // Update role
    if (role === 'admin') {
      // Add to admins if not already
      if (!workspace.admins.some((adminId: Types.ObjectId) => adminId.toString() === userId)) {
        workspace.admins.push(new Types.ObjectId(userId));
      }
    } else {
      // Remove from admins if role is not admin
      workspace.admins = workspace.admins.filter(
        (adminId: Types.ObjectId) => adminId.toString() !== userId
      );
    }

    await workspace.save();

    res.status(200).json({
      success: true,
      data: workspace,
      message: 'Member role updated successfully.'
    });
  } catch (error) {
    logger.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error updating member role.'
    });
  }
};
