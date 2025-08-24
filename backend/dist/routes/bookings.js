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
const express_1 = require("express");
const Booking_1 = __importDefault(require("../models/Booking"));
const router = (0, express_1.Router)();
// GET /api/bookings - Get all bookings
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield Booking_1.default.find()
            .populate('user', 'name email')
            .populate('resource', 'name type')
            .sort({ createdAt: -1 });
        return res.json({
            success: true,
            data: bookings
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
}));
// GET /api/bookings/:id - Get single booking
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking_1.default.findById(req.params.id)
            .populate('user', 'name email')
            .populate('resource', 'name type');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        return res.json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
}));
// POST /api/bookings - Create new booking
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = new Booking_1.default(req.body);
        yield booking.save();
        const populatedBooking = yield Booking_1.default.findById(booking._id)
            .populate('user', 'name email')
            .populate('resource', 'name type');
        return res.status(201).json({
            success: true,
            data: populatedBooking
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
}));
// PUT /api/bookings/:id - Update booking
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('user', 'name email')
            .populate('resource', 'name type');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        return res.json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
}));
// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking_1.default.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        return res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting booking',
            error: error.message
        });
    }
}));
exports.default = router;
