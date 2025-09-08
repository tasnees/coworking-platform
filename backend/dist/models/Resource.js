"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const resourceSchema = new mongoose_1.Schema({
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
resourceSchema.methods.isAvailableAt = function (date) {
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
exports.Resource = mongoose_1.default.model('Resource', resourceSchema);
