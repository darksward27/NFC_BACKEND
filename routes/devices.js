import express from 'express';
import { Device } from '../models/index.js';

const router = express.Router();

// Get all devices
router.get('/', async (req, res) => {
    try {
        const { active, location } = req.query;
        let query = {};

        if (active !== undefined) {
            query.active = active === 'true';
        }
        if (location) {
            query.location = location;
        }

        const devices = await Device.find(query).sort({ deviceId: 1 });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register new device
router.post('/', async (req, res) => {
    try {
        const device = new Device(req.body);
        await device.save();
        res.status(201).json(device);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update device
router.put('/:id', async (req, res) => {
    try {
        const device = await Device.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Toggle registration mode
router.patch('/:id/registration-mode', async (req, res) => {
    try {
        const { isRegistrationMode } = req.body;
        const device = await Device.findByIdAndUpdate(
            req.params.id,
            { isRegistrationMode },
            { new: true }
        );
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete device
router.delete('/:id', async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 