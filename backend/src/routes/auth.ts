import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Settings from '../models/Settings';

const router = express.Router();

// Register new user
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { firstName, lastName, email, password, membershipType } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Get system settings
    const settings = await (Settings as any).getSettings();
    if (!settings) {
      res.status(500).json({
        success: false,
        message: 'Failed to load system settings'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      membershipType: membershipType || 'member',
      membershipStatus: 'active',
      role: 'member',
      isEmailVerified: false,
      approvalStatus: settings.requireAdminApproval ? 'pending' : 'approved',
      permissions: [],
      preferences: {
        emailNotifications: true,
        securityAlerts: true,
        systemAlerts: true,
        twoFactorEnabled: false
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: settings.requireAdminApproval 
        ? 'Registration successful. Your account is pending admin approval.' 
        : 'Registration successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus,
          membershipStatus: user.membershipStatus
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Admin approve/reject user
router.patch('/approve/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const { action, adminId } = req.body; // action: 'approve' | 'reject'

    // Validate required fields
    if (!userId || !action || !adminId) {
      res.status(400).json({
        success: false,
        message: 'User ID, action, and admin ID are required'
      });
      return;
    }

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Must be either "approve" or "reject"'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    user.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    user.approvedBy = adminId;
    user.approvedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: `User ${action}d successfully`,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          approvalStatus: user.approvalStatus,
          approvedBy: user.approvedBy,
          approvedAt: user.approvedAt
        }
      }
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during approval'
    });
  }
});

// Get pending users for admin review
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingUsers
    });

  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Login route with approval check
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check approval status
    if (user.approvalStatus === 'pending') {
      res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval'
      });
      return;
    }

    if (user.approvalStatus === 'rejected') {
      res.status(403).json({
        success: false,
        message: 'Your account has been rejected by admin'
      });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

export default router;
