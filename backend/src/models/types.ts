import { Document, Types } from 'mongoose';

export interface IResource extends Document {
  name: string;
  description?: string;
  type: string;
  capacity?: number;
  isActive: boolean;
  location?: string;
  admins?: Types.ObjectId[];
  owner?: Types.ObjectId;
  // Add other resource fields as needed
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  capacity: number;
  location: string;
  amenities: string[];
  isActive: boolean;
  owner?: Types.ObjectId;
  // Add other workspace fields as needed
}

// Re-export IUser for convenience
export type { IUser } from './User';
