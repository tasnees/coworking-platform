import { Document, Types } from 'mongoose';

export interface IResource extends Document {
  name: string;
  type: 'desk' | 'meeting_room' | 'phone_booth' | 'event_space';
  description?: string;
  capacity: number;
  location: string;
  floor?: string;
  amenities: string[];
  images: string[];
  hourlyRate: number;
  dailyRate: number;
  isAvailable: boolean;
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  bookingRules: {
    minDuration: number;
    maxDuration: number;
    advanceBooking: number;
    cancellationNotice: number;
  };
  owner: Types.ObjectId;
  admins: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isAvailableAt(date: Date, duration: number): boolean;
}

declare const Resource: import('mongoose').Model<IResource>;

export default Resource;
