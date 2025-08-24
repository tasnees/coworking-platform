import mongoose, { Schema, Document } from 'mongoose';

// Extend the base IResource interface with Resource-specific fields
export interface IResource  {
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
  };
  bookingRules: {
    minDuration: number;
    maxDuration: number;
    advanceBooking: number;
    cancellationNotice: number;
  };
}

export interface IResourceDocument extends IResource, Document {
  // You can add document-specific methods here
  isAvailableAt(date: Date, duration: number): boolean;
}


const resourceSchema = new Schema<IResourceDocument>({
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['desk', 'meeting_room', 'phone_booth', 'event_space'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: [0, 'Hourly rate must be non-negative']
  },
  dailyRate: {
    type: Number,
    required: true,
    min: [0, 'Daily rate must be non-negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  availability: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      available: { type: Boolean, default: true }
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      available: { type: Boolean, default: true }
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      available: { type: Boolean, default: true }
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      available: { type: Boolean, default: true }
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      available: { type: Boolean, default: true }
    },
    saturday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '16:00' },
      available: { type: Boolean, default: false }
    },
    sunday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '16:00' },
      available: { type: Boolean, default: false }
    }
  },
  bookingRules: {
    minDuration: { type: Number, default: 30, min: 15 }, // 30 minutes
    maxDuration: { type: Number, default: 480, max: 1440 }, // 8 hours
    advanceBooking: { type: Number, default: 30, max: 365 }, // 30 days
    cancellationNotice: { type: Number, default: 24, min: 1 } // 24 hours
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
resourceSchema.index({ type: 1, isAvailable: 1 });
resourceSchema.index({ location: 1, floor: 1 });
resourceSchema.index({ hourlyRate: 1 });

// Virtual for checking if resource is available at specific time
resourceSchema.methods.isAvailableAt = function(date: Date, duration: number): boolean {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayAvailability = this.availability[dayOfWeek];
  
  if (!dayAvailability || !dayAvailability.available) {
    return false;
  }

  return true;
};

// Ensure virtual fields are serialized
resourceSchema.set('toJSON', {
  virtuals: true
});

export const Resource = mongoose.model<IResourceDocument>('Resource', resourceSchema);

