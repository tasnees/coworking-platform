import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'BOOKING_CONFIRMATION' | 'BOOKING_REMINDER' | 'PAYMENT_RECEIVED' | 'ACCOUNT_UPDATE' | 'SYSTEM_ALERT' | 'NEW_MESSAGE' | 'MEMBERSHIP_RENEWAL' | 'PROMOTIONAL';
export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED' | 'DELETED';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  readAt?: Date;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['BOOKING_CONFIRMATION', 'BOOKING_REMINDER', 'PAYMENT_RECEIVED', 'ACCOUNT_UPDATE', 'SYSTEM_ALERT', 'NEW_MESSAGE', 'MEMBERSHIP_RENEWAL', 'PROMOTIONAL'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['UNREAD', 'READ', 'ARCHIVED', 'DELETED'],
    default: 'UNREAD'
  },
  readAt: {
    type: Date
  },
  data: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: 1 });

// Virtual for checking if notification is unread
notificationSchema.virtual('isUnread').get(function() {
  return this.status === 'UNREAD';
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  if (this.status === 'UNREAD') {
    this.status = 'READ';
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware to update timestamps
notificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'READ' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

export default mongoose.model<INotification>('Notification', notificationSchema);
