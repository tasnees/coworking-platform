import { Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
      [key: string]: unknown;
    };
  }
}

// Define query parameters type
type RequestQuery = ParsedQs & {
  status?: string;
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
  workspaceId?: string;
  [key: string]: unknown;
};

// Define params type
type RequestParams = ParamsDictionary & {
  id?: string;
  workspaceId?: string;
  [key: string]: string | undefined;
};

// Extend the Express Request type with our custom properties
type CustomRequest = Request & {
  user?: {
    id: string;
    role: string;
    [key: string]: unknown;
  };
  query: RequestQuery;
  params: RequestParams;
};
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import auth from '../middleware/auth';
import { isWorkspaceMember } from '../middleware/workspace';

// Define controller response type
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Define controller functions with proper types
type BookingController = {
  createBooking: (req: CustomRequest) => Promise<ApiResponse>;
  getBooking: (req: CustomRequest) => Promise<ApiResponse>;
  getBookings: (req: CustomRequest) => Promise<ApiResponse>;
  updateBooking: (req: CustomRequest) => Promise<ApiResponse>;
  cancelBooking: (req: CustomRequest) => Promise<ApiResponse>;
  checkAvailability: (req: CustomRequest) => Promise<ApiResponse>;
};

// Mock controller implementations
const bookingController: BookingController = {
  createBooking: async () => { throw new Error('Not implemented'); },
  getBooking: async () => { throw new Error('Not implemented'); },
  getBookings: async () => { throw new Error('Not implemented'); },
  updateBooking: async () => { throw new Error('Not implemented'); },
  cancelBooking: async () => { throw new Error('Not implemented'); },
  checkAvailability: async () => { throw new Error('Not implemented'); }
};

// Destructure controller methods
const {
  createBooking,
  getBooking,
  getBookings,
  updateBooking,
  cancelBooking,
  checkAvailability
} = bookingController;

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
  async (req: CustomRequest) => {
    // Create a new query object with the user ID
    const queryParams = { 
      ...req.query, 
      userId: req.user?.id 
    };
    
    // Create a new request object with the extended query
    const requestWithQuery: CustomRequest = {
      ...req,
      query: {
        ...req.query,
        ...queryParams
      } as RequestQuery,
      params: {
        ...req.params
      } as RequestParams
    };
    
    try {
      const result = await getBookings(requestWithQuery);
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get bookings');
    }
  }
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
  async (req: CustomRequest) => {
    // Create a new query object with the workspace ID
    const queryParams = { 
      ...req.query, 
      workspaceId: req.params.workspaceId 
    };
    
    // Create a new request object with the extended query
    const requestWithQuery: CustomRequest = {
      ...req,
      query: {
        ...req.query,
        ...queryParams
      } as RequestQuery,
      params: {
        ...req.params
      } as RequestParams
    };
    
    try {
      const result = await getBookings(requestWithQuery);
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get bookings');
    }
  }
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
