import express from 'express';
import mongoose from 'mongoose';
import AttendanceSettings from '../models/AttendanceSettings.js';

const router = express.Router();

// Get attendance settings by organizationId
router.get('/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        console.log('Fetching settings for organization:', organizationId);
        
        if (!mongoose.Types.ObjectId.isValid(organizationId)) {
            return res.status(400).json({ error: 'Invalid organization ID format' });
        }

        let settings = await AttendanceSettings.findOne({ organizationId });
        
        if (!settings) {
            console.log('Creating default settings for organization:', organizationId);
            settings = new AttendanceSettings({
                organizationId,
                workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                workHours: {
                    start: '09:00',
                    end: '17:00'
                },
                graceTime: 15
            });
            await settings.save();
        }
        
        res.json(settings);
    } catch (error) {
        console.error('Error in attendance settings route:', error);
        res.status(500).json({ 
            error: 'Failed to fetch attendance settings',
            details: error.message
        });
    }
});

// Update attendance settings
router.put('/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const settings = await AttendanceSettings.findOneAndUpdate(
            { organizationId },
            req.body,
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (error) {
        console.error('Error updating attendance settings:', error);
        res.status(500).json({ error: 'Failed to update attendance settings' });
    }
});

export default router; 