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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvailability = exports.cancelBooking = exports.updateBooking = exports.getBooking = exports.createBooking = exports.getBookings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const email_1 = require("../utils/email");
// Models
const User = mongoose_1.default.model('User');
const Resource = mongoose_1.default.model('Resource');
const Workspace = mongoose_1.default.model('Workspace');
const Booking = mongoose_1.default.model('Booking');
// Booking controller functions
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const filter = {};
        if (typeof req.query.userId === 'string') {
            filter.user = new mongoose_1.Types.ObjectId(req.query.userId);
        }
        if (typeof req.query.workspaceId === 'string') {
            filter.workspace = new mongoose_1.Types.ObjectId(req.query.workspaceId);
        }
        if (typeof req.query.status === 'string') {
            filter.status = req.query.status;
        }
        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.startTime = {};
            if (req.query.startDate) {
                filter.startTime.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                const endDate = new Date(req.query.endDate);
                endDate.setHours(23, 59, 59, 999);
                filter.startTime.$lte = endDate;
            }
        }
        // For regular users, only show their own bookings
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'member' || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'staff') {
            filter.user = new mongoose_1.Types.ObjectId(req.user.id);
        }
        // For workspace admins, show bookings for their workspaces
        if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'admin') {
            const workspaces = yield Workspace.find({
                admins: { $in: [req.user.id] }
            }).select('_id');
            if (workspaces.length > 0) {
                filter.workspace = {
                    $in: workspaces.map(w => w._id)
                };
            }
        }
        const [bookings, total] = yield Promise.all([
            Booking.find(filter)
                .populate('user', 'name email')
                .populate('resource', 'name')
                .populate('workspace', 'name')
                .sort({ startTime: 1 })
                .limit(10),
            Booking.countDocuments(filter)
        ]);
        return res.status(200).json({
            success: true,
            data: bookings,
            total
        });
    }
    catch (error) {
        logger_1.logger.error('Get bookings error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.getBookings = getBookings;
// Create booking function
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId, resourceId, workspaceId, startTime, endTime } = req.body;
        // Validate user
        const user = yield User.findById(userId).select('+isActive');
        if (!user || !user.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or inactive user'
            });
        }
        // Validate resource
        const resource = yield Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }
        // Check resource permissions
        if (!resource.admins.some(adminId => { var _a; return adminId.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); }) &&
            resource.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to book this resource'
            });
        }
        // Validate workspace
        const workspace = yield Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                error: 'Workspace not found'
            });
        }
        // Create booking
        const booking = yield Booking.create({
            user: userId,
            resource: resourceId,
            workspace: workspaceId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: 'pending'
        });
        // Send confirmation email
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: `Booking Confirmation - ${workspace.name}`,
            template: 'booking-confirmation',
            context: {
                name: user.name,
                workspaceName: workspace.name,
                startTime: new Date(startTime).toLocaleString(),
                endTime: new Date(endTime).toLocaleString()
            }
        });
        return res.status(201).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        logger_1.logger.error('Create booking error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.createBooking = createBooking;
// Get single booking
const getBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const booking = yield Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate('resource', 'name')
            .populate('workspace', 'name');
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        // Check permission
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' &&
            booking.user.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }
        return res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        logger_1.logger.error('Get booking error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.getBooking = getBooking;
// Update booking
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { status } = req.body;
        const booking = yield Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        // Only allow admin and the booking owner to update
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' &&
            booking.user.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }
        booking.status = status;
        yield booking.save();
        // Send email notification
        const user = yield User.findById(booking.user);
        const workspace = yield Workspace.findById(booking.workspace);
        if (user && workspace) {
            yield (0, email_1.sendEmail)({
                to: user.email,
                subject: `Booking ${status} - ${workspace.name}`,
                template: 'booking-update',
                context: {
                    name: user.name,
                    workspaceName: workspace.name,
                    status,
                    startTime: booking.startTime.toLocaleString(),
                    endTime: booking.endTime.toLocaleString()
                }
            });
        }
        return res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        logger_1.logger.error('Update booking error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.updateBooking = updateBooking;
// Cancel booking
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const booking = yield Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        // Only allow admin and the booking owner to cancel
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' &&
            booking.user.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }
        booking.status = 'cancelled';
        yield booking.save();
        // Send cancellation email
        const user = yield User.findById(booking.user);
        const workspace = yield Workspace.findById(booking.workspace);
        if (user && workspace) {
            yield (0, email_1.sendEmail)({
                to: user.email,
                subject: `Booking Cancelled - ${workspace.name}`,
                template: 'booking-cancelled',
                context: {
                    name: user.name,
                    workspaceName: workspace.name,
                    startTime: booking.startTime.toLocaleString(),
                    endTime: booking.endTime.toLocaleString()
                }
            });
        }
        return res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        logger_1.logger.error('Cancel booking error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.cancelBooking = cancelBooking;
// Check availability
const checkAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resourceId, startTime, endTime } = req.query;
        if (!resourceId || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                error: 'Please provide resourceId, startTime and endTime'
            });
        }
        const conflictingBookings = yield Booking.find({
            resource: resourceId,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    startTime: {
                        $lt: new Date(endTime),
                        $gte: new Date(startTime)
                    }
                },
                {
                    endTime: {
                        $gt: new Date(startTime),
                        $lte: new Date(endTime)
                    }
                }
            ]
        });
        const isAvailable = conflictingBookings.length === 0;
        return res.status(200).json({
            success: true,
            data: {
                isAvailable,
                conflictingBookings: isAvailable ? [] : conflictingBookings
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Check availability error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.checkAvailability = checkAvailability;
