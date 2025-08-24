import { Response } from 'express';
import { Document, Types } from 'mongoose';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter: UserFilter = {};
    if (req.query.role) filter.role = req.query.role as string;
    if (req.query.isActive) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { name: { $regex: searchRegex, $options: 'i' } },
        { email: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.user?.id)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const updateData: UserUpdateData = {};
    const { name, email } = req.body;

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/users/update-password
 * @access  Private
 */
export const updatePassword = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    const userDoc = user as unknown as UserDocument;
    await sendEmail({
      to: userDoc.email,
      subject: 'Password Updated',
      template: 'password-updated',
      context: { name: userDoc.name }
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Update password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { role } = req.body;

    // Only admin can update roles
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update user roles'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Update user role error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Deactivate user account
 * @route   PUT /api/users/deactivate
 * @access  Private
 */
export const deactivateAccount = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user?.role !== 'admin' && req.params.id !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to deactivate this account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userDoc = user as unknown as UserDocument;
    await sendEmail({
      to: userDoc.email,
      subject: 'Account Deactivated',
      template: 'account-deactivated',
      context: { name: userDoc.name }
    });

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate account error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete users'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Base user interface
interface IUser {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

// Extended document type
interface UserDocument extends Document, IUser {
  _id: Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

interface UserFilter {
  role?: string;
  isActive?: boolean;
  $or?: Array<{
    name?: { $regex: RegExp; $options: string };
    email?: { $regex: RegExp; $options: string };
  }>;
}

interface UserUpdateData {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}
