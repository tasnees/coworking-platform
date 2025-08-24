import { Document, Types, Model } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  type: 'desk' | 'meeting_room' | 'private_office' | 'event_space';
  capacity: number;
  amenities: string[];
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: [number, number];
  };
  workingHours: {
    monday: { open: number; close: number };
    tuesday: { open: number; close: number };
    wednesday: { open: number; close: number };
    thursday: { open: number; close: number };
    friday: { open: number; close: number };
    saturday: { open: number; close: number } | null;
    sunday: { open: number; close: number } | null;
  };
  images: string[];
  pricePerHour: number;
  pricePerDay: number;
  minimumBookingTime: number; // in minutes
  bufferTime: number; // in minutes
  timezone: string;
  bookingWindowDays: number;
  owner: Types.ObjectId;
  admins: Types.ObjectId[];
  members: Types.ObjectId[];
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

declare const Workspace: Model<IWorkspace>;

export default Workspace;
