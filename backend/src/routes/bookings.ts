import { Router } from 'express';
import Booking from '../models/Booking';

const router = Router();

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('resource', 'name type')
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      data: bookings
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('resource', 'name type');
    
    return res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
});

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
});

export default router;
