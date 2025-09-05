import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  // Optional full name (virtual or stored)
  name?: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: 'member' | 'staff' | 'admin';
  membershipType?: string;
  membershipStatus?: 'active' | 'inactive' | 'suspended';
  tokenVersion: number;
  isActive: boolean;
  lastLogin?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isEmailVerified: boolean;
  permissions?: string[];
  joinDate?: Date;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | mongoose.Types.ObjectId;
  approvedAt?: Date;
  preferences?: {
    emailNotifications: boolean;
    securityAlerts: boolean;
    systemAlerts: boolean;
    twoFactorEnabled: boolean;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  matchPassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
}

// Define the user schema
const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['member', 'staff', 'admin'],
    default: 'member'
  },
  membershipType: {
    type: String,
    default: 'basic'
  },
  membershipStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  tokenVersion: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: {
    type: Date
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: String
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method (alias: matchPassword)
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Alias for comparePassword
userSchema.methods.matchPassword = userSchema.methods.comparePassword;

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function(): string {
  const payload = { id: this._id, tokenVersion: this.tokenVersion };
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const options: jwt.SignOptions = { expiresIn: '1d' }; // Default to 1 day
  
  if (process.env.JWT_EXPIRE) {
    options.expiresIn = parseInt(process.env.JWT_EXPIRE, 10) || '1d';
  }
  
  return jwt.sign(payload, secret, options);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function(): string {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
// The transform function removes sensitive fields when converting to JSON
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    // Use destructuring to exclude sensitive fields (type-safe approach)
    const {
      password,
      emailVerificationToken,
      passwordResetToken,
      tokenVersion,
      _id,
      ...cleanRet
    } = ret;
    
    // Return clean object with id field
    return {
      ...cleanRet,
      id: _id
    };
  } 
});

// Create and export the User model
export const User = mongoose.model<IUser>('User', userSchema);

// Export the IUserDocument type for use in other files
export type IUserDocument = Document<unknown, Record<string, unknown>, IUser> & 
  Omit<IUser, keyof Document> & {
    comparePassword(candidatePassword: string): Promise<boolean>;
    matchPassword(candidatePassword: string): Promise<boolean>;
    getSignedJwtToken(): string;
    getResetPasswordToken(): string;
  };