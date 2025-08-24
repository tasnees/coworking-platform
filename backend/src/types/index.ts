import { Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  owner?: Types.ObjectId;
  admins?: Types.ObjectId[];
  members?: Types.ObjectId[];
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive?: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  tokenVersion?: number;
  permissions?: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
}

export interface IResource extends Document {
  _id: Types.ObjectId;
  name: string;
  type: 'desk' | 'meeting_room' | 'private_office';
  workspace: Types.ObjectId;
  capacity?: number;
  features?: string[];
  isActive?: boolean;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  resource: Types.ObjectId;
  workspace: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
