import { Request } from 'express';
import { ObjectId } from 'mongodb';

export interface Booking {
  id: string;
  workspaceId: string | ObjectId;
  userId: string | ObjectId;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  attendees?: string[] | ObjectId[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancelledBy?: string | ObjectId;
  cancellationReason?: string;
}

export interface CreateBookingRequest {
  workspaceId: string;
  startTime: string | Date;
  endTime: string | Date;
  purpose?: string;
  attendees?: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string | Date;
    occurrences?: number;
  };
}

export interface UpdateBookingRequest {
  startTime?: string | Date;
  endTime?: string | Date;
  purpose?: string;
  status?: 'confirmed' | 'cancelled';
  cancellationReason?: string;
}

export interface BookingQueryParams {
  status?: 'upcoming' | 'past' | 'cancelled';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  workspaceId?: string;
  userId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  query: BookingQueryParams;
}

export type BookingResponse = Booking | Booking[] | PaginatedResponse<Booking> | { message: string; booking?: Booking; };

export interface BookingController {
  createBooking(req: AuthRequest): Promise<BookingResponse>;
  getBooking(req: AuthRequest): Promise<BookingResponse>;
  getBookings(req: AuthRequest): Promise<BookingResponse>;
  updateBooking(req: AuthRequest): Promise<BookingResponse>;
  cancelBooking(req: AuthRequest): Promise<BookingResponse>;
  checkAvailability(req: AuthRequest): Promise<{ available: boolean; conflict?: Booking }>;
}
