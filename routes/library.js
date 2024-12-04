import express from 'express';
import { Library } from '../models/index.js';

const router = express.Router();

// Get all libraries
router.get('/', async (req, res) => {
    try {
        const libraries = await Library.find()
            .populate('organizationId')
            .populate('departmentId');
        res.json(libraries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new library
router.post('/', async (req, res) => {
    try {
        const library = new Library(req.body);
        await library.save();
        res.status(201).json(library);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update library
router.put('/:id', async (req, res) => {
    try {
        const library = await Library.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!library) {
            return res.status(404).json({ error: 'Library not found' });
        }
        res.json(library);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete library
router.delete('/:id', async (req, res) => {
    try {
        const library = await Library.findByIdAndDelete(req.params.id);
        if (!library) {
            return res.status(404).json({ error: 'Library not found' });
        }
        res.json({ message: 'Library deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 