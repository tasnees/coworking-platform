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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const auth_1 = require("../middleware/auth");
const booking_controller_1 = require("../controllers/booking.controller");
const workspace_1 = require("../middleware/workspace");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware);
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
], validateRequest_1.validateRequest, booking_controller_1.createBooking);
// @route   GET /api/bookings/availability
// @desc    Check workspace availability
// @access  Private
router.get('/availability', [
    (0, express_validator_1.query)('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    (0, express_validator_1.query)('startTime').isISO8601().withMessage('Valid start time is required'),
    (0, express_validator_1.query)('endTime').isISO8601().withMessage('Valid end time is required'),
    (0, express_validator_1.query)('excludeBookingId').optional().isMongoId().withMessage('Invalid booking ID'),
], validateRequest_1.validateRequest, booking_controller_1.checkAvailability);
// @route   GET /api/bookings/me
// @desc    Get current user's bookings
// @access  Private
router.get('/me', [
    (0, express_validator_1.query)('status').optional().isIn(['upcoming', 'past', 'cancelled']).withMessage('Invalid status filter'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], validateRequest_1.validateRequest, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Create a new query object with the user ID
    const query = Object.assign(Object.assign({}, req.query), { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    // Call getBookings with the original request but override the query
    return (0, booking_controller_1.getBookings)(Object.assign(Object.assign({}, req), { query }), res);
})));
// @route   GET /api/bookings/workspace/:workspaceId
// @desc    Get all bookings for a workspace
// @access  Private/Workspace Member
router.get('/workspace/:workspaceId', [
    (0, express_validator_1.param)('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.query)('status').optional().isIn(['upcoming', 'past', 'cancelled']).withMessage('Invalid status filter'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceMember, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a new query object with the workspace ID
    const query = Object.assign(Object.assign({}, req.query), { workspaceId: req.params.workspaceId });
    // Call getBookings with the original request but override the query
    return (0, booking_controller_1.getBookings)(Object.assign(Object.assign({}, req), { query }), res);
})));
// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid booking ID is required'),
], validateRequest_1.validateRequest, booking_controller_1.getBooking);
// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid booking ID is required'),
    (0, express_validator_1.body)('startTime').optional().isISO8601().withMessage('Valid start time is required'),
    (0, express_validator_1.body)('endTime').optional().isISO8601().withMessage('Valid end time is required'),
    (0, express_validator_1.body)('purpose').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['confirmed', 'cancelled']).withMessage('Invalid status'),
], validateRequest_1.validateRequest, booking_controller_1.updateBooking);
// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid booking ID is required'),
], validateRequest_1.validateRequest, booking_controller_1.cancelBooking);
exports.default = router;
