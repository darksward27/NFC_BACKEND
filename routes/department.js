import express from 'express';
import Department from '../models/Department.js';
import Card from '../models/Card.js';
import { broadcast } from '../utils/websocket.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { organizationId } = req.query;
        const query = organizationId ? { organizationId } : {};
        const departments = await Department.find(query).sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, organizationId, description, location, active } = req.body;
        
        // Validate required fields
        if (!name || !organizationId) {
            return res.status(400).json({ 
                error: 'Name and organizationId are required fields' 
            });
        }

        // Validate organizationId format
        if (!mongoose.Types.ObjectId.isValid(organizationId)) {
            return res.status(400).json({ 
                error: 'Invalid organizationId format' 
            });
        }

        const department = new Department({
            name,
            organizationId,
            description,
            location,
            active: active ?? true
        });

        await department.save();
        broadcast({ type: 'departmentAdded', department });
        res.status(201).json(department);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to create department' 
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        broadcast({ type: 'departmentUpdated', department });
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update department' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        await Card.deleteMany({ departmentId: req.params.id });

        broadcast({ type: 'departmentDeleted', id: req.params.id });
        res.json({ message: 'Department and associated cards deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

export default router; 