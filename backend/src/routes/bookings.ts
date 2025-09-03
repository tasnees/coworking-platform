import express, { Request } from 'express';
import Booking, { IBooking } from '../models/Booking';
import { UpdateQuery } from 'mongoose';

// Extend the Express Request type to include our custom types
interface CustomRequest extends Omit<Request, 'body' | 'params'> {
  params: {
    id?: string;
  };
  body: BookingRequestBody;
}

const router = express.Router();

// Define interfaces for better type safety
interface BookingRequestBody {
  user: string;
  resource: string;
  startTime: Date;
  endTime: Date;
  status?: string;
  notes?: string;
}

// GET /api/bookings - Get all bookings
router.get('/', async () => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('resource', 'name type')
    .sort({ createdAt: -1 });
  
  return { success: true, bookings };
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req: CustomRequest) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email')
    .populate('resource', 'name type');
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  return { success: true, booking };
});

// POST /api/bookings - Create new booking
router.post('/', async (req: CustomRequest) => {
  const booking = new Booking(req.body as BookingRequestBody);
  await booking.save();
  
  const populatedBooking = await Booking.findById(booking._id)
    .populate('user', 'name email')
    .populate('resource', 'name type');
  
  return { success: true, booking: populatedBooking };
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req: CustomRequest) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body as UpdateQuery<IBooking>,
    { new: true, runValidators: true }
  )
    .populate('user', 'name email')
    .populate('resource', 'name type');
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  return { success: true, booking };
});

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', async (req: CustomRequest) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  return { success: true, message: 'Booking deleted successfully' };
});

export default router;