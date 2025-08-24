"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvailability = exports.cancelBooking = exports.updateBooking = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const logger_1 = require("../utils/logger");
const Booking_1 = __importDefault(require("../models/Booking"));
const Resource_1 = __importDefault(require("../models/Resource"));
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../utils/email");
const mongoose_1 = require("mongoose");
// Type guard for PopulatedUser
const isPopulatedUser = (user) => {
    return user && typeof user === 'object' && 'email' in user;
};
// Type guard for ResourceReference
const isResourceReference = (resource) => {
    return resource && typeof resource === 'object' && 'name' in resource && 'type' in resource;
};
// Type guard for Workspace
const isWorkspace = (workspace) => {
    return workspace && typeof workspace === 'object' && 'name' in workspace;
};
/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { workspaceId, startTime, endTime, notes } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Check if user exists and is active
        const user = yield User_1.default.findById(userId).select('+isActive');
        if (!user || !user.isActive) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found or inactive.'
            });
        }
        // Get the resource to check permissions
        const resource = yield Resource_1.default.findById(workspaceId);
        if (!resource) {
            return res.status(404).json({
                success: false,
                code: 'RESOURCE_NOT_FOUND',
                message: 'Resource not found.'
            });
        }
        // Check if user has permission to view this booking
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) !== userId &&
            !resource.admins.some((adminId) => { var _a; return adminId.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); }) &&
            resource.owner.toString() !== ((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'You do not have permission to check availability.'
            });
        }
        // Check if workspace exists and is active
        const workspace = yield Workspace.findById(workspaceId);
        if (!workspace || !workspace.isActive) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found or inactive.'
            });
        }
        // Check if user has permission to check availability
        if (((_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== 'admin' &&
            !workspace.admins.some((id) => { var _a; return id.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); }) &&
            !workspace.members.some((id) => { var _a; return id.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); }) &&
            workspace.owner.toString() !== ((_f = req.user) === null || _f === void 0 ? void 0 : _f.id)) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'You do not have permission to check availability.'
            });
        }
        // Check if user is a member of the workspace
        const isMember = yield Workspace.exists({
            _id: workspaceId,
            $or: [
                { members: new mongoose_1.Types.ObjectId(userId) },
                { admins: new mongoose_1.Types.ObjectId(userId) },
                { owner: new mongoose_1.Types.ObjectId(userId) }
            ]
        });
        if (!isMember) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'You are not a member of this workspace.'
            });
        }
        // Validate booking times
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        if (start >= end) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_TIME_RANGE',
                message: 'End time must be after start time.'
            });
        }
        if (start < now) {
            return res.status(400).json({
                success: false,
                code: 'PAST_BOOKING',
                message: 'Cannot create booking in the past.'
            });
        }
        // Check for conflicting bookings
        const existingBookings = yield Booking_1.default.find({
            workspace: new mongoose_1.Types.ObjectId(workspaceId),
            status: { $ne: 'cancelled' },
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } },
                { startTime: { $gte: start, $lt: end } },
                { endTime: { $gt: start, $lte: end } }
            ]
        });
        if (existingBookings.length > 0) {
            return res.status(409).json({
                success: false,
                code: 'BOOKING_CONFLICT',
                message: 'The selected time slot is already booked.',
                data: {
                    conflictingBookingId: existingBookings[0]._id,
                    conflictingStartTime: existingBookings[0].startTime,
                    conflictingEndTime: existingBookings[0].endTime
                }
            });
        }
        // Create booking
        const booking = yield Booking_1.default.create({
            user: userId,
            workspace: workspaceId,
            startTime: start,
            endTime: end,
            notes,
            status: 'confirmed'
        });
        // Populate workspace and user details for response
        const populatedBooking = (yield Booking_1.default.populate(booking, [
            { path: 'workspace', select: 'name owner' },
            { path: 'user', select: 'name email' }
        ]));
        const getUserEmail = (user) => {
            return isPopulatedUser(user) ? user.email : '';
        };
        const getWorkspaceName = (workspace) => {
            return isPopulatedWorkspace(workspace) ? workspace.name : '';
        };
        // Send booking confirmation email
        yield (0, email_1.sendEmail)({
            to: getUserEmail(populatedBooking.user),
            subject: `Booking Confirmation - ${getWorkspaceName(populatedBooking.workspace)}`,
            template: 'booking-confirmation',
            context: {
                name: typeof populatedBooking.user === 'object' && 'name' in populatedBooking.user ? populatedBooking.user.name : '',
                workspaceName: getWorkspaceName(populatedBooking.workspace),
                startTime: booking.startTime.toLocaleString(),
                endTime: booking.endTime.toLocaleString(),
                bookingId: booking._id
            }
        });
        res.status(201).json({
            success: true,
            data: booking,
            message: 'Booking created successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error creating booking.'
        });
    }
});
exports.createBooking = createBooking;
/**
 * @desc    Get all bookings (with filters)
 * @route   GET /api/bookings
 * @access  Private
 */
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        // Filtering
        const filter = {};
        // Apply filters based on query params
        if (req.query.userId)
            filter.user = req.query.userId;
        if (req.query.workspaceId)
            filter.workspace = req.query.workspaceId;
        if (req.query.status)
            filter.status = req.query.status;
        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.startTime = {};
            if (req.query.startDate)
                filter.startTime.$gte = new Date(req.query.startDate);
            if (req.query.endDate) {
                const endDate = new Date(req.query.endDate);
                endDate.setHours(23, 59, 59, 999); // End of the day
                filter.startTime.$lte = endDate;
            }
        }
        // For regular users, only show their own bookings
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'user') {
            filter.user = req.user.id;
        }
        // For workspace admins, show bookings for their workspaces
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'admin' || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'manager') {
            const workspaces = yield Workspace.find({
                $or: [
                    { owner: req.user.id },
                    { admins: req.user.id }
                ]
            }).select('_id');
            filter.workspace = { $in: workspaces.map((w) => w._id) };
        }
        // Execute query with pagination
        const [bookings, total] = yield Promise.all([
            Booking_1.default.find(filter)
                .populate('user', 'name email')
                .populate('workspace', 'name')
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(limit),
            Booking_1.default.countDocuments(filter)
        ]);
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        res.status(200).json({
            success: true,
            count: bookings.length,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                hasNextPage,
                hasPreviousPage,
                nextPage: hasNextPage ? page + 1 : null,
                previousPage: hasPreviousPage ? page - 1 : null
            },
            data: bookings
        });
    }
    catch (error) {
        logger_1.logger.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error fetching bookings.'
        });
    }
});
exports.getBookings = getBookings;
/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const booking = yield Booking_1.default.findById(req.params.id)
            .populate('user', 'name email')
            .populate('workspace', 'name');
        if (!booking) {
            return res.status(404).json({
                success: false,
                code: 'BOOKING_NOT_FOUND',
                message: 'Booking not found.'
            });
        }
        // Check permissions
        const isOwner = booking.user.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const workspaceId = booking.workspace.toString();
        const isWorkspaceAdmin = yield Workspace.exists({
            _id: workspaceId,
            $or: [
                { owner: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id },
                { admins: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id }
            ]
        });
        if (!isOwner && !isWorkspaceAdmin && ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'You do not have permission to view this booking.'
            });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        logger_1.logger.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error fetching booking.'
        });
    }
});
exports.getBooking = getBooking;
/**
 * @desc    Update booking
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { startTime, endTime, notes, status } = req.body;
        const bookingId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Find booking
        const booking = yield Booking_1.default.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                code: 'BOOKING_NOT_FOUND',
                message: 'Booking not found.'
            });
        }
        // Check permissions
        const isOwner = booking.user.toString() === userId;
        const workspaceId = booking.workspace.toString();
        const isWorkspaceAdmin = yield Workspace.exists({
            _id: workspaceId,
            $or: [
                { owner: userId },
                { admins: userId }
            ]
        });
        if (!isOwner && !isWorkspaceAdmin && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'You do not have permission to update this booking.'
            });
        }
        // Validate status transition
        if (status && status !== booking.status) {
            const validTransitions = {
                'pending': ['confirmed', 'cancelled', 'rejected'],
                'confirmed': ['completed', 'cancelled'],
                'completed': [],
                'cancelled': [],
                'rejected': []
            };
            if (!((_c = validTransitions[booking.status]) === null || _c === void 0 ? void 0 : _c.includes(status))) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_STATUS_TRANSITION',
                    message: `Cannot change status from ${booking.status} to ${status}.`
                });
            }
        }
        // Update fields
        if (startTime)
            booking.startTime = new Date(startTime);
        if (endTime)
            booking.endTime = new Date(endTime);
        if (notes !== undefined)
            booking.notes = notes;
        if (status)
            booking.status = status;
        // Check for time conflicts (if times are being updated)
        if (startTime || endTime) {
            const start = startTime ? new Date(startTime) : booking.startTime;
            const end = endTime ? new Date(endTime) : booking.endTime;
            if (start >= end) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_TIME_RANGE',
                    message: 'End time must be after start time.'
                });
            }
            const existingBookings = yield Booking_1.default.find({
                _id: { $ne: bookingId },
                workspace: booking.workspace,
                status: { $ne: 'cancelled' },
                $or: [
                    { startTime: { $lt: end }, endTime: { $gt: start } },
                    { startTime: { $gte: start, $lt: end } },
                    { endTime: { $gt: start, $lte: end } }
                ]
            });
            if (existingBookings.length > 0) {
                return res.status(409).json({
                    success: false,
                    code: 'BOOKING_CONFLICT',
                    message: 'The selected time slot is already booked.'
                });
            }
        }
        yield booking.save();
        // Populate for response
        const populatedBooking = (yield Booking_1.default.populate(booking, [
            { path: 'user', select: 'name email' },
            { path: 'workspace', select: 'name' }
        ]));
        // Send update notification email
        if (status && status !== booking.status) {
            yield (0, email_1.sendEmail)({
                to: booking.user.email,
                subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - ${booking.workspace.name}`,
                template: 'booking-status-update',
                context: {
                    name: booking.user.name,
                    workspaceName: booking.workspace.name,
                    status: status.charAt(0).toUpperCase() + status.slice(1),
                    startTime: booking.startTime.toLocaleString(),
                    endTime: booking.endTime.toLocaleString(),
                    bookingId: booking._id
                }
            });
        }
        res.status(200).json({
            success: true,
            data: booking,
            message: 'Booking updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating booking.'
        });
    }
});
exports.updateBooking = updateBooking;
/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const bookingId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Find booking
        const booking = yield Booking_1.default.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                code: 'BOOKING_NOT_FOUND',
                message: 'Booking not found.'
            });
        }
        // Check permissions
        const isOwner = booking.user.toString() === userId;
        const workspaceId = booking.workspace.toString();
        const isWorkspaceAdmin = yield Workspace.exists({
            _id: workspaceId,
            $or: [
                { owner: userId },
                { admins: userId }
            ]
        });
        if (!isOwner && !isWorkspaceAdmin && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'You do not have permission to cancel this booking.'
            });
        }
        // Check if booking can be cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                code: 'ALREADY_CANCELLED',
                message: 'Booking is already cancelled.'
            });
        }
        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                code: 'BOOKING_COMPLETED',
                message: 'Cannot cancel a completed booking.'
            });
        }
        // Update status
        booking.status = 'cancelled';
        yield booking.save();
        // Populate for response and email
        const populatedBooking = (yield Booking_1.default.populate(booking, [
            { path: 'user', select: 'name email' },
            { path: 'workspace', select: 'name' }
        ]));
        // Send cancellation email
        yield (0, email_1.sendEmail)({
            to: booking.user.email,
            subject: `Booking Cancelled - ${booking.workspace.name}`,
            template: 'booking-cancellation',
            context: {
                name: booking.user.name,
                workspaceName: booking.workspace.name,
                startTime: booking.startTime.toLocaleString(),
                endTime: booking.endTime.toLocaleString(),
                bookingId: booking._id,
                cancelledBy: isOwner ? 'you' : 'an administrator'
            }
        });
        res.status(200).json({
            success: true,
            data: booking,
            message: 'Booking cancelled successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error cancelling booking.'
        });
    }
});
exports.cancelBooking = cancelBooking;
/**
 * @desc    Check workspace availability
 * @route   GET /api/workspaces/:id/availability
 * @access  Private
 */
const checkAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startTime, endTime } = req.query;
        const workspaceId = req.params.id;
        // Validate input
        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_PARAMETERS',
                message: 'startTime and endTime are required.'
            });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (start >= end) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_TIME_RANGE',
                message: 'End time must be after start time.'
            });
        }
        // Check for conflicting bookings
        const existingBookings = yield Booking_1.default.find({
            workspace: workspaceId,
            status: { $ne: 'cancelled' },
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } },
                { startTime: { $gte: start, $lt: end } },
                { endTime: { $gt: start, $lte: end } }
            ]
        });
        const isAvailable = existingBookings.length === 0;
        res.status(200).json({
            success: true,
            data: {
                available: isAvailable,
                conflictingBooking: isAvailable ? null : {
                    id: existingBookings[0]._id,
                    startTime: existingBookings[0].startTime,
                    endTime: existingBookings[0].endTime,
                    status: existingBookings[0].status
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error checking workspace availability.'
        });
    }
});
exports.checkAvailability = checkAvailability;
