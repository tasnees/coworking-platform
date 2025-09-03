import mongoose, { Schema, Types } from 'mongoose';
import { IWorkspace as IBaseWorkspace } from '../types';

// Extend the base IWorkspace interface with Workspace-specific fields
export interface IWorkspace extends Omit<IBaseWorkspace, 'location' | 'type'> {
  // Override location to be an object instead of string
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  
  // Additional Workspace-specific fields
  type: 'desk' | 'meeting_room' | 'private_office' | 'event_space';
  capacity: number;
  amenities?: string[];
  owner: Types.ObjectId;
  admins: Types.ObjectId[];
  members: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, trim: true },
    type: { type: String, required: true, enum: ['desk', 'meeting_room', 'private_office', 'event_space'] },
    capacity: { type: Number, required: true, min: 1 },
    amenities: [{ type: String }],
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: { type: [Number], index: '2dsphere' },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: mongoose.Document & { _id: Types.ObjectId }, ret: Record<string, unknown>): Record<string, unknown> {
        if ('__v' in ret) delete ret.__v;
        if ('_id' in ret) {
          ret.id = doc._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc: mongoose.Document & { _id: Types.ObjectId }, ret: Record<string, unknown>): Record<string, unknown> {
        if ('__v' in ret) delete ret.__v;
        delete ret._id;
        ret.id = doc._id.toString();
        return ret;
      },
    },
  }
);

// Add text index for search
WorkspaceSchema.index(
  { 'name': 'text', 'description': 'text', 'location.address': 'text' },
  { weights: { name: 10, 'location.address': 5, description: 1 } }
);

// Add owner to admins array if not already present
WorkspaceSchema.pre('save', function (next) {
  if (this.isNew && !this.admins.includes(this.owner)) {
    this.admins.push(this.owner);
  }
  next();
});

// Add owner to members array if not already present
WorkspaceSchema.pre('save', function (next) {
  if (this.isNew && !this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

// Update the updatedAt timestamp before saving
WorkspaceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

export default Workspace;
