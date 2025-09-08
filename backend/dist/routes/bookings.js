"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Booking_1 = __importDefault(require("../models/Booking"));
const router = express_1.default.Router();
// GET /api/bookings - Get all bookings
router.get('/', async () => {
    const bookings = await Booking_1.default.find()
        .populate('user', 'name email')
        .populate('resource', 'name type')
        .sort({ createdAt: -1 });
    return { success: true, bookings };
});
// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req) => {
    const booking = await Booking_1.default.findById(req.params.id)
        .populate('user', 'name email')
        .populate('resource', 'name type');
    if (!booking) {
        throw new Error('Booking not found');
    }
    return { success: true, booking };
});
// POST /api/bookings - Create new booking
router.post('/', async (req) => {
    const booking = new Booking_1.default(req.body);
    await booking.save();
    const populatedBooking = await Booking_1.default.findById(booking._id)
        .populate('user', 'name email')
        .populate('resource', 'name type');
    return { success: true, booking: populatedBooking };
});
// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req) => {
    const booking = await Booking_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('user', 'name email')
        .populate('resource', 'name type');
    if (!booking) {
        throw new Error('Booking not found');
    }
    return { success: true, booking };
});
// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', async (req) => {
    const booking = await Booking_1.default.findByIdAndDelete(req.params.id);
    if (!booking) {
        throw new Error('Booking not found');
    }
    return { success: true, message: 'Booking deleted successfully' };
});
exports.default = router;
