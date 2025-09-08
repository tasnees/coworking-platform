"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Resource_1 = require("../models/Resource");
const router = (0, express_1.Router)();
// GET /api/resources - Get all resources
router.get('/', async (req) => {
    try {
        const { type, isAvailable } = req.query;
        const query = {};
        if (type)
            query.type = type;
        if (isAvailable !== undefined)
            query.isAvailable = isAvailable === 'true';
        const resources = await Resource_1.Resource.find(query).sort({ name: 1 });
        return {
            success: true,
            data: resources
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Error fetching resources',
            error: error instanceof Error ? error.message : String(error)
        };
    }
});
// GET /api/resources/:id - Get single resource
router.get('/:id', async (req) => {
    try {
        const resource = await Resource_1.Resource.findById(req.params.id);
        if (!resource) {
            return {
                success: false,
                message: 'Resource not found'
            };
        }
        return {
            success: true,
            data: resource
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Error fetching resource',
            error: error instanceof Error ? error.message : String(error)
        };
    }
});
// POST /api/resources - Create new resource
router.post('/', async (req) => {
    try {
        const resource = new Resource_1.Resource(req.body);
        await resource.save();
        return {
            success: true,
            data: resource
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Error creating resource',
            error: error instanceof Error ? error.message : String(error)
        };
    }
});
// PUT /api/resources/:id - Update resource
router.put('/:id', async (req) => {
    try {
        const resource = await Resource_1.Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!resource) {
            return {
                success: false,
                message: 'Resource not found'
            };
        }
        return {
            success: true,
            data: resource
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Error updating resource',
            error: error instanceof Error ? error.message : String(error)
        };
    }
});
// DELETE /api/resources/:id - Delete resource
router.delete('/:id', async (req) => {
    try {
        const resource = await Resource_1.Resource.findByIdAndDelete(req.params.id);
        if (!resource) {
            return {
                success: false,
                message: 'Resource not found'
            };
        }
        return {
            success: true,
            message: 'Resource deleted successfully'
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Error deleting resource',
            error: error instanceof Error ? error.message : String(error)
        };
    }
});
exports.default = router;
