import { Router } from 'express';
import Resource from '../models/Resource';

const router = Router();

interface QueryParams {
  type?: string;
  isAvailable?: string;
}

// GET /api/resources - Get all resources
router.get('/', async (req, res) => {
  try {
    const { type, isAvailable } = req.query as QueryParams;
    
    let query: any = {};
    if (type) query.type = type;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    
    const resources = await Resource.find(query).sort({ name: 1 });
    
    return res.json({
      success: true,
      data: resources
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message
    });
  }
});

// GET /api/resources/:id - Get single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    return res.json({
      success: true,
      data: resource
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching resource',
      error: error.message
    });
  }
});

// POST /api/resources - Create new resource
router.post('/', async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    
    return res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Error creating resource',
      error: error.message
    });
  }
});

// PUT /api/resources/:id - Update resource
router.put('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    return res.json({
      success: true,
      data: resource
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Error updating resource',
      error: error.message
    });
  }
});

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message
    });
  }
});

export default router;
