// src/routes/settings.ts
import express from 'express';
import Settings, { ISettings } from '../models/Settings';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = express.Router();

// Get current settings
router.get('/', async (_req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update settings (admin only)
router.patch(
  '/',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const {
        requireAdminApproval,
        siteName,
        maintenanceMode,
        maxUsers,
        sessionTimeout,
      } = req.body;

      const settings = await Settings.getSettings();

      if (requireAdminApproval !== undefined)
        settings.requireAdminApproval = requireAdminApproval;
      if (siteName !== undefined) settings.siteName = siteName;
      if (maintenanceMode !== undefined)
        settings.maintenanceMode = maintenanceMode;
      if (maxUsers !== undefined) settings.maxUsers = maxUsers;
      if (sessionTimeout !== undefined)
        settings.sessionTimeout = sessionTimeout;

      // At this point req.user exists thanks to auth + admin middleware
      settings.updatedBy = req.user ? (req.user as { _id: string })._id.toString() : 'system';
      settings.updatedAt = new Date();



      await settings.save();

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

export default router;