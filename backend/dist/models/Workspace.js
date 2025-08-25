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
exports.WorkspaceModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the schema
const WorkspaceSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    admins: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    members: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            delete ret._id;
            ret.id = doc._id.toString();
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            delete ret._id;
            ret.id = doc._id.toString();
            return ret;
        },
    },
});
// Add text index for search
WorkspaceSchema.index({ 'name': 'text', 'description': 'text', 'location.address': 'text' }, { weights: { name: 10, 'location.address': 5, description: 1 } });
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
exports.WorkspaceModel = mongoose_1.default.model('Workspace', WorkspaceSchema);
