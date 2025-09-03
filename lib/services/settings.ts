import { Types } from 'mongoose';
import Settings from '@/backend/src/models/Settings';

export interface SettingsData {
  requireAdminApproval: boolean;
  siteName: string;
  maintenanceMode: boolean;
  maxUsers: number;
  sessionTimeout: number;
  updatedBy?: Types.ObjectId;
  updatedAt?: Date;
}

interface SettingsResponse<T = SettingsData> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class SettingsService {
  async getSettings(): Promise<SettingsResponse> {
    try {
      const settings = await Settings.getSettings();
      return { 
        success: true, 
        data: settings.toObject() 
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch settings');
    }
  }

  async updateSettings(data: Partial<SettingsData>, userId: string): Promise<SettingsResponse> {
    try {
      const settings = await Settings.getSettings();
      
      Object.assign(settings, {
        ...data,
        updatedBy: new Types.ObjectId(userId),
        updatedAt: new Date()
      });

      const updatedSettings = await settings.save();
      return {
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings.toObject()
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update settings');
    }
  }

  private handleError(error: unknown, defaultMessage: string): SettingsResponse {
    const message = error instanceof Error ? error.message : defaultMessage;
    return { 
      success: false, 
      error: message,
      message
    };
  }
}

export const settingsService = new SettingsService();
export type { SettingsResponse };
