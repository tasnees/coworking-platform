import { Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: 'member' | 'staff' | 'admin';
  membershipType?: string;
  membershipStatus: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  lastLogin?: Date;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
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
  
  // Additional properties found in usage
  tokenVersion: number;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  name?: string; // For compatibility with some auth flows
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  matchPassword(password: string): Promise<boolean>; // Alias for comparePassword
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
  
  // Virtuals
  fullName: string;
}
