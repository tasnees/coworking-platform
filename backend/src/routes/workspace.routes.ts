import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { 
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaces,
  addMember,
  removeMember,
  updateMemberRole,
  getWorkspaceMembers
} from '../controllers/workspace.controller';
import { isWorkspaceAdmin, isWorkspaceMember } from '../middleware/workspace';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/workspaces
// @desc    Create a new workspace
// @access  Private
router.post(
  '/',
  [
    body('name').trim().not().isEmpty().withMessage('Workspace name is required'),
    body('description').optional().trim(),
    body('type').isIn(['open', 'private']).withMessage('Invalid workspace type'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array'),
    body('location').optional().trim(),
  ],
  validateRequest,
  createWorkspace
);

// @route   GET /api/workspaces
// @desc    Get all workspaces (with optional filtering)
// @access  Private
router.get(
  '/',
  [
    query('type').optional().isIn(['all', 'my', 'public']).withMessage('Invalid filter type'),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  getWorkspaces
);

// @route   GET /api/workspaces/:id
// @desc    Get workspace by ID
// @access  Private
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
  ],
  validateRequest,
  isWorkspaceMember,
  getWorkspace
);

// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private/Workspace Admin
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
    body('name').optional().trim().not().isEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim(),
    body('type').optional().isIn(['open', 'private']).withMessage('Invalid workspace type'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array'),
    body('location').optional().trim(),
  ],
  validateRequest,
  isWorkspaceAdmin,
  updateWorkspace
);

// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private/Workspace Admin
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
  ],
  validateRequest,
  isWorkspaceAdmin,
  deleteWorkspace
);

// @route   GET /api/workspaces/:id/members
// @desc    Get workspace members
// @access  Private/Workspace Member
router.get(
  '/:id/members',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
  ],
  validateRequest,
  isWorkspaceMember,
  getWorkspaceMembers
);

// @route   POST /api/workspaces/:id/members
// @desc    Add a member to a workspace
// @access  Private (Workspace Admin/Owner)
router.post(
  '/:id/members',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('role').optional().isIn(['member', 'admin']).withMessage('Invalid role')
  ],
  validateRequest,
  isWorkspaceAdmin,
  addMember
);

// @route   PUT /api/workspaces/:id/members/:userId/role
// @desc    Update member role
// @access  Private/Workspace Admin
router.put(
  '/:id/members/:userId/role',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('role').isIn(['member', 'admin']).withMessage('Invalid role'),
  ],
  validateRequest,
  isWorkspaceAdmin,
  updateMemberRole
);

// @route   DELETE /api/workspaces/:id/members/:userId
// @desc    Remove a member from a workspace
// @access  Private (Workspace Admin/Owner or self)
router.delete(
  '/:id/members/:userId',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validateRequest,
  isWorkspaceAdmin,
  removeMember
);

// @route   POST /api/workspaces/:id/join
// @desc    Join a public workspace
// @access  Private
router.post(
  '/:id/join',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
  ],
  validateRequest,
  addMember
);

// @route   POST /api/workspaces/:id/leave
// @desc    Leave a workspace
// @access  Private
router.post(
  '/:id/leave',
  [
    param('id').isMongoId().withMessage('Invalid workspace ID'),
  ],
  validateRequest,
  removeMember
);

export { router as workspaceRoutes };
