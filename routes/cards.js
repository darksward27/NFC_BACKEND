import express from 'express';
import { Card, BiometricData } from '../models/index.js';

const router = express.Router();

// Get all cards
router.get('/', async (req, res) => {
    try {
        const { departmentId, status, type } = req.query;
        let query = {};

        if (departmentId) query.departmentId = departmentId;
        if (status) query.status = status;
        if (type) query.type = type;

        const cards = await Card.find(query)
            .populate('organizationId')
            .populate('departmentId')
            .populate('biometricId')
            .sort({ holderName: 1 });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register new card
router.post('/', async (req, res) => {
    try {
        const card = new Card(req.body);
        await card.save();
        res.status(201).json(card);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Card ID already exists' });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

// Update card
router.put('/:id', async (req, res) => {
    try {
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('organizationId departmentId biometricId');
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update card status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete card
router.delete('/:id', async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Delete associated biometric data if exists
        if (card.biometricId) {
            await BiometricData.findByIdAndDelete(card.biometricId);
        }

        await card.deleteOne();
        res.json({ message: 'Card and associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 