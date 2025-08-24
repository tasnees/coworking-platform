import { Router, Response, RequestHandler } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware as auth } from '../middleware/auth';
import { 
  createBooking,
  getBooking,
  getBookings,
  updateBooking,
  cancelBooking,
  checkAvailability
} from '../controllers/booking.controller';
import { AuthRequest } from '../middleware/auth';
import { isWorkspaceMember } from '../middleware/workspace';

const router = Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post(
  '/',
  [
    body('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('purpose').optional().trim(),
    body('attendees').optional().isArray().withMessage('Attendees must be an array'),
    body('recurring').optional().isObject().withMessage('Recurring options must be an object'),
  ],
  validateRequest,
  createBooking
);

// @route   GET /api/bookings/availability
// @desc    Check workspace availability
// @access  Private
router.get(
  '/availability',
  [
    query('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    query('startTime').isISO8601().withMessage('Valid start time is required'),
    query('endTime').isISO8601().withMessage('Valid end time is required'),
    query('excludeBookingId').optional().isMongoId().withMessage('Invalid booking ID'),
  ],
  validateRequest,
  checkAvailability
);

// @route   GET /api/bookings/me
// @desc    Get current user's bookings
// @access  Private
router.get(
  '/me',
  [
    query('status').optional().isIn(['upcoming', 'past', 'cancelled']).withMessage('Invalid status filter'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  (async (req: AuthRequest, res: Response) => {
    // Create a new query object with the user ID
    const query = { ...req.query, userId: req.user?.id };
    // Call getBookings with the original request but override the query
    return getBookings({ ...req, query } as unknown as AuthRequest, res);
  }) as RequestHandler
);

// @route   GET /api/bookings/workspace/:workspaceId
// @desc    Get all bookings for a workspace
// @access  Private/Workspace Member
router.get(
  '/workspace/:workspaceId',
  [
    param('workspaceId').isMongoId().withMessage('Valid workspace ID is required'),
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    query('status').optional().isIn(['upcoming', 'past', 'cancelled']).withMessage('Invalid status filter'),
  ],
  validateRequest,
  isWorkspaceMember,
  (async (req: AuthRequest, res: Response) => {
    // Create a new query object with the workspace ID
    const query = { ...req.query, workspaceId: req.params.workspaceId };
    // Call getBookings with the original request but override the query
    return getBookings({ ...req, query } as unknown as AuthRequest, res);
  }) as RequestHandler
);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  getBooking
);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    body('startTime').optional().isISO8601().withMessage('Valid start time is required'),
    body('endTime').optional().isISO8601().withMessage('Valid end time is required'),
    body('purpose').optional().trim(),
    body('status').optional().isIn(['confirmed', 'cancelled']).withMessage('Invalid status'),
  ],
  validateRequest,
  updateBooking
);

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  cancelBooking
);

export default router;
