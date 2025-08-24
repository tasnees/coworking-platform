import { Document, Types, Model } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  type: string;
  capacity: number;
  amenities: string[];
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  owner: Types.ObjectId;
  admins: Types.ObjectId[];
  members: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceModel extends Model<IWorkspace> {}
