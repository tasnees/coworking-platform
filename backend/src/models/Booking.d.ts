import { Document, Types } from 'mongoose';

export interface IBooking extends Document {
  user: Types.ObjectId | IUser;
  resource: Types.ObjectId | IResource;
  resourceType: 'desk' | 'meeting_room' | 'phone_booth' | 'event_space';
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  checkInTime?: Date;
  checkOutTime?: Date;
  duration: number;
  recurring?: {
    isRecurring: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// These interfaces should be defined in their respective model files
declare interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  // Add other user properties as needed
}

declare interface IResource {
  _id: Types.ObjectId;
  name: string;
  type: string;
  // Add other resource properties as needed
}

declare const Booking: import('mongoose').Model<IBooking>;

export default Booking;
