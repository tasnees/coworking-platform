import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  requireAdminApproval: boolean;
  siteName: string;
  maintenanceMode: boolean;
  maxUsers: number;
  sessionTimeout: number;
  updatedBy: string;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
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

// Create or update settings
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Add static method
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
