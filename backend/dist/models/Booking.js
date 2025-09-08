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
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resource: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            required: function () {
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
bookingSchema.virtual('isPast').get(function () {
    return this.endTime < new Date();
});
// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function () {
    const now = new Date();
    return this.startTime <= now && this.endTime >= now && this.status === 'confirmed';
});
// Pre-save middleware to calculate duration
bookingSchema.pre('save', function (next) {
    if (this.isModified('startTime') || this.isModified('endTime')) {
        this.duration = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    }
    next();
});
// Ensure virtual fields are serialized
bookingSchema.set('toJSON', {
    virtuals: true
});
exports.default = mongoose_1.default.model('Booking', bookingSchema);
