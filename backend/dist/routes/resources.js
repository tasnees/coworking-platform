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
const Resource_1 = require("../models/Resource");
const router = (0, express_1.Router)();
// GET /api/resources - Get all resources
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, isAvailable } = req.query;
        const query = {};
        if (type)
            query.type = type;
        if (isAvailable !== undefined)
            query.isAvailable = isAvailable === 'true';
        const resources = yield Resource_1.Resource.find(query).sort({ name: 1 });
        return res.json({
            success: true,
            data: resources
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching resources',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
// GET /api/resources/:id - Get single resource
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = yield Resource_1.Resource.findById(req.params.id);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching resource',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
// POST /api/resources - Create new resource
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = new Resource_1.Resource(req.body);
        yield resource.save();
        return res.status(201).json({
            success: true,
            data: resource
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error creating resource',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
// PUT /api/resources/:id - Update resource
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = yield Resource_1.Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error updating resource',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
// DELETE /api/resources/:id - Delete resource
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = yield Resource_1.Resource.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting resource',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
exports.default = router;
