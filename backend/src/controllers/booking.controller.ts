import { Request, Response } from 'express';
import mongoose, { Document, Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

// Type definitions
interface BookingFilter {
  user?: Types.ObjectId;
  workspace?: Types.ObjectId | { $in: Types.ObjectId[] };
  status?: string;
  startTime?: {
    $gte?: Date;
    $lte?: Date;
  };
}

interface IUser extends Document {
  _id: Types.ObjectId;
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface IResource extends Document {
  _id: Types.ObjectId;
  name: string;
  admins: Types.ObjectId[];
  owner: Types.ObjectId;
  notes?: string;
}

interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  admins: Types.ObjectId[];
  owner: Types.ObjectId;
}

interface IBooking extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  resource: Types.ObjectId | IResource;
  workspace: Types.ObjectId | IWorkspace;
  startTime: Date;
  endTime: Date;
  status: string;
  notes?: string;
}

// Models
const User = mongoose.model<IUser>('User');
const Resource = mongoose.model<IResource>('Resource');
const Workspace = mongoose.model<IWorkspace>('Workspace');
const Booking = mongoose.model<IBooking>('Booking');

// Booking controller functions
export const getBookings = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const filter: BookingFilter = {};
    
    if (typeof req.query.userId === 'string') {
      filter.user = new Types.ObjectId(req.query.userId);
    }
    if (typeof req.query.workspaceId === 'string') {
      filter.workspace = new Types.ObjectId(req.query.workspaceId);
    }
    if (typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.startTime = {};
      if (req.query.startDate) {
        filter.startTime.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate as string);
        endDate.setHours(23, 59, 59, 999);
        filter.startTime.$lte = endDate;
      }
    }

    // For regular users, only show their own bookings
    if (req.user?.role === 'member' || req.user?.role === 'staff') {
      filter.user = new Types.ObjectId(req.user.id);
    }

    // For workspace admins, show bookings for their workspaces
    if (req.user?.role === 'admin') {
      const workspaces = await Workspace.find({
        admins: { $in: [req.user.id] }
      }).select('_id');
      
      if (workspaces.length > 0) {
        filter.workspace = { 
          $in: workspaces.map(w => w._id) 
        };
      }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('resource', 'name')
        .populate('workspace', 'name')
        .sort({ startTime: 1 })
        .limit(10),
      Booking.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: bookings,
      total
    });

  } catch (error) {
    logger.error('Get bookings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create booking function
export const createBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { userId, resourceId, workspaceId, startTime, endTime } = req.body;

    // Validate user
    const user = await User.findById(userId).select('+isActive');
    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive user'
      });
    }

    // Validate resource
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Check resource permissions
    if (
      !resource.admins.some(adminId => adminId.toString() === req.user?.id) &&
      resource.owner.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to book this resource'
      });
    }

    // Validate workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      resource: resourceId,
      workspace: workspaceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'pending'
    });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: `Booking Confirmation - ${workspace.name}`,
      template: 'booking-confirmation',
      context: {
        name: user.name,
        workspaceName: workspace.name,
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString()
      }
    });

    return res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    logger.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single booking
export const getBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('resource', 'name')
      .populate('workspace', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check permission
    if (
      req.user?.role !== 'admin' &&
      booking.user.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    logger.error('Get booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update booking
export const updateBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Only allow admin and the booking owner to update
    if (
      req.user?.role !== 'admin' &&
      booking.user.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    booking.status = status;
    await booking.save();

    // Send email notification
    const user = await User.findById(booking.user);
    const workspace = await Workspace.findById(booking.workspace);

    if (user && workspace) {
      await sendEmail({
        to: user.email,
        subject: `Booking ${status} - ${workspace.name}`,
        template: 'booking-update',
        context: {
          name: user.name,
          workspaceName: workspace.name,
          status,
          startTime: booking.startTime.toLocaleString(),
          endTime: booking.endTime.toLocaleString()
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    logger.error('Update booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Only allow admin and the booking owner to cancel
    if (
      req.user?.role !== 'admin' &&
      booking.user.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Send cancellation email
    const user = await User.findById(booking.user);
    const workspace = await Workspace.findById(booking.workspace);

    if (user && workspace) {
      await sendEmail({
        to: user.email,
        subject: `Booking Cancelled - ${workspace.name}`,
        template: 'booking-cancelled',
        context: {
          name: user.name,
          workspaceName: workspace.name,
          startTime: booking.startTime.toLocaleString(),
          endTime: booking.endTime.toLocaleString()
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    logger.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Check availability
export const checkAvailability = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { resourceId, startTime, endTime } = req.query;
    
    if (!resourceId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Please provide resourceId, startTime and endTime'
      });
    }

    const conflictingBookings = await Booking.find({
      resource: resourceId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { 
            $lt: new Date(endTime as string),
            $gte: new Date(startTime as string)
          }
        },
        {
          endTime: {
            $gt: new Date(startTime as string),
            $lte: new Date(endTime as string)
          }
        }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;

    return res.status(200).json({
      success: true,
      data: {
        isAvailable,
        conflictingBookings: isAvailable ? [] : conflictingBookings
      }
    });

  } catch (error) {
    logger.error('Check availability error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
