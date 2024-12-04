import express from 'express';
import { BiometricData, Card } from '../models/index.js';

const router = express.Router();

// Get biometric data
router.get('/:cardId', async (req, res) => {
    try {
        const biometric = await BiometricData.findOne({ cardId: req.params.cardId });
        if (!biometric) {
            return res.status(404).json({ error: 'Biometric data not found' });
        }
        res.json(biometric);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register biometric data
router.post('/', async (req, res) => {
    try {
        const { cardId, templateData } = req.body;

        // Check if card exists
        const card = await Card.findOne({ id: cardId });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Create or update biometric data
        const biometric = await BiometricData.findOneAndUpdate(
            { cardId },
            { templateData },
            { new: true, upsert: true }
        );

        res.status(201).json(biometric);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete biometric data
router.delete('/:cardId', async (req, res) => {
    try {
        const biometric = await BiometricData.findOneAndDelete({ cardId: req.params.cardId });
        if (!biometric) {
            return res.status(404).json({ error: 'Biometric data not found' });
        }
        res.json({ message: 'Biometric data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 