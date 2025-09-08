"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const auth_1 = __importDefault(require("../middleware/auth"));
const workspace_1 = require("../middleware/workspace");
// Mock controller implementations
const bookingController = {
    createBooking: async () => { throw new Error('Not implemented'); },
    getBooking: async () => { throw new Error('Not implemented'); },
    getBookings: async () => { throw new Error('Not implemented'); },
    updateBooking: async () => { throw new Error('Not implemented'); },
    cancelBooking: async () => { throw new Error('Not implemented'); },
    checkAvailability: async () => { throw new Error('Not implemented'); }
};
// Destructure controller methods
const { createBooking, getBooking, getBookings, updateBooking, cancelBooking, checkAvailability } = bookingController;
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.default);
// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
    (0, express_validator_1.body)('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    (0, express_validator_1.body)('startTime').isISO8601().withMessage('Valid start time is required'),
    (0, express_validator_1.body)('endTime').isISO8601().withMessage('Valid end time is required'),
    (0, express_validator_1.body)('purpose').optional().trim(),
    (0, express_validator_1.body)('attendees').optional().isArray().withMessage('Attendees must be an array'),
    (0, express_validator_1.body)('recurring').optional().isObject().withMessage('Recurring options must be an object'),
], validateRequest_1.validateRequest, createBooking);
// @route   GET /api/bookings/availability
// @desc    Check workspace availability
// @access  Private
router.get('/availability', [
    (0, express_validator_1.query)('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    (0, express_validator_1.query)('startTime').isISO8601().withMessage('Valid start time is required'),
    (0, express_validator_1.query)('endTime').isISO8601().withMessage('Valid end time is required'),
    (0, express_validator_1.query)('excludeBookingId').optional().isMongoId().withMessage('Invalid booking ID'),
], validateRequest_1.validateRequest, checkAvailability);
// @route   GET /api/bookings/me
// @desc    Get current user's bookings
// @access  Private
router.get('/me', [
    (0, express_validator_1.query)('status').optional().isIn(['upcoming', 'past', 'cancelled']).withMessage('Invalid status filter'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], validateRequest_1.validateRequest, async (req) => {
    // Create a new query object with the user ID
    const queryParams = {
        ...req.query,
        userId: req.user?.id
    };
    // Create a new request object with the extended query
    const requestWithQuery = {
        ...req,
        query: {
            ...req.query,
            ...queryParams
        },
        params: {
            ...req.params
        }
    };
    try {
        const result = await getBookings(requestWithQuery);
        return result;
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get bookings');
    }
});
// @route   GET /api/bookings/workspace/:workspaceId
// @desc    Get all bookings for a workspace
// @access  Private/Workspace Member
router.get('/workspace/:workspaceId', [
    (0, express_validator_1.param)('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.query)('status').optional().isIn(['upcoming', 'past', 'cancelled']).withMessage('Invalid status filter'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceMember, async (req) => {
    // Create a new query object with the workspace ID
    const queryParams = {
        ...req.query,
        workspaceId: req.params.workspaceId
    };
    // Create a new request object with the extended query
    const requestWithQuery = {
        ...req,
        query: {
            ...req.query,
            ...queryParams
        },
        params: {
            ...req.params
        }
    };
    try {
        const result = await getBookings(requestWithQuery);
        return result;
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get bookings');
    }
});
// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid booking ID is required'),
], validateRequest_1.validateRequest, getBooking);
// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid booking ID is required'),
    (0, express_validator_1.body)('startTime').optional().isISO8601().withMessage('Valid start time is required'),
    (0, express_validator_1.body)('endTime').optional().isISO8601().withMessage('Valid end time is required'),
    (0, express_validator_1.body)('purpose').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['confirmed', 'cancelled']).withMessage('Invalid status'),
], validateRequest_1.validateRequest, updateBooking);
// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid booking ID is required'),
], validateRequest_1.validateRequest, cancelBooking);
exports.default = router;
