import { Document, Types, Model } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  name: string;
  role: 'member' | 'staff' | 'admin' | 'superadmin';
  membershipType?: string;
  membershipStatus: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  lastLogin?: Date;
  isEmailVerified: boolean;
  isActive: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  tokenVersion: number;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | Types.ObjectId;
  approvedAt?: Date;
  permissions: string[];
  preferences: {
    emailNotifications: boolean;
    securityAlerts: boolean;
    systemAlerts: boolean;
    twoFactorEnabled: boolean;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  matchPassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  createPasswordResetToken(): string;
  incrementTokenVersion(): Promise<void>;
  save(): Promise<this>;
}

// Add static methods to the model
export interface IUserModel extends Model<IUser> {
  // Add any static methods here if needed
}

declare const User: IUserModel;

export default User;
