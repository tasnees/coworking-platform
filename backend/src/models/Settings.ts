import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  requireAdminApproval: boolean;
  siteName: string;
  maintenanceMode: boolean;
  maxUsers: number;
  sessionTimeout: number;
  updatedBy: string;
  updatedAt: Date;
}

// Interface for static methods
export interface ISettingsModel extends Model<ISettings> {
  getSettings(): Promise<ISettings>;
}

const settingsSchema = new Schema<ISettings, ISettingsModel>({
  requireAdminApproval: {
    type: Boolean,
    default: false
  },
  siteName: {
    type: String,
    default: 'Coworking Platform'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maxUsers: {
    type: Number,
    default: 1000
  },
  sessionTimeout: {
    type: Number,
    default: 30
  },
  updatedBy: {
    type: String,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add static method
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Use the extended interface with both ISettings and ISettingsModel
const Settings = mongoose.model<ISettings, ISettingsModel>('Settings', settingsSchema);

export default Settings;