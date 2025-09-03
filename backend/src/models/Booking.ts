import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  resource: mongoose.Types.ObjectId;
  resourceType: 'desk' | 'meeting_room' | 'phone_booth' | 'event_space';
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  checkInTime?: Date;
  checkOutTime?: Date;
  duration: number; // in minutes
  recurring?: {
    isRecurring: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['desk', 'meeting_room', 'phone_booth', 'event_space'],
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'],
      required: function(this: { recurring?: { isRecurring: boolean } }) { 
        return this.recurring?.isRecurring; 
      }
    },
    endDate: { type: Date }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
bookingSchema.index({ user: 1, startTime: 1 });
bookingSchema.index({ resource: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });

// Virtual for checking if booking is in the past
bookingSchema.virtual('isPast').get(function() {
  return this.endTime < new Date();
});

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now && this.status === 'confirmed';
});

// Pre-save middleware to calculate duration
bookingSchema.pre('save', function(next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    this.duration = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
  next();
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<IBooking>('Booking', bookingSchema);
