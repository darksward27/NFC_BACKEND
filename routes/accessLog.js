import express from 'express';
import { AccessLog, Card } from '../models/index.js';

const router = express.Router();

// Get access logs with filtering
router.get('/', async (req, res) => {
    try {
        const { 
            deviceId, 
            cardId, 
            startDate, 
            endDate, 
            authorized,
            verificationMethod
        } = req.query;

        let query = {};

        if (deviceId) query.deviceId = deviceId;
        if (cardId) query.cardId = cardId;
        if (authorized !== undefined) query.authorized = authorized === 'true';
        if (verificationMethod) query.verificationMethod = verificationMethod;
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await AccessLog.find(query)
            .populate('deviceId')
            .sort({ timestamp: -1 })
            .limit(1000);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new access log
router.post('/', async (req, res) => {
    try {
        const log = new AccessLog(req.body);
        await log.save();

        // Update card's last access if authorized
        if (log.authorized && log.cardId) {
            await Card.findOneAndUpdate(
                { id: log.cardId },
                { lastAccess: log.timestamp }
            );
        }

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get access logs for a specific card
router.get('/card/:cardId', async (req, res) => {
    try {
        const logs = await AccessLog.find({ 
            cardId: req.params.cardId 
        })
        .populate('deviceId')
        .sort({ timestamp: -1 })
        .limit(100);
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get access logs for a specific device
router.get('/device/:deviceId', async (req, res) => {
    try {
        const logs = await AccessLog.find({ 
            deviceId: req.params.deviceId 
        })
        .sort({ timestamp: -1 })
        .limit(100);
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get access statistics
router.get('/access-stats', async (req, res) => {
    try {
        const { organizationId, departmentId, startDate, endDate } = req.query;
        
        let matchQuery = {};
        
        // Add date range to match query
        if (startDate || endDate) {
            matchQuery.timestamp = {};
            if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
            if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
        }

        // Add organization/department filters if provided
        if (organizationId) {
            matchQuery['card.organizationId'] = organizationId;
        }
        if (departmentId) {
            matchQuery['card.departmentId'] = departmentId;
        }

        const stats = await AccessLog.aggregate([
            {
                $lookup: {
                    from: 'cards',
                    localField: 'cardId',
                    foreignField: 'id',
                    as: 'card'
                }
            },
            {
                $unwind: '$card'
            },
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: null,
                    totalAccess: { $sum: 1 },
                    authorizedAccess: {
                        $sum: { $cond: ['$authorized', 1, 0] }
                    },
                    unauthorizedAccess: {
                        $sum: { $cond: ['$authorized', 0, 1] }
                    },
                    cardOnlyVerifications: {
                        $sum: { $cond: [{ $eq: ['$verificationMethod', 'card'] }, 1, 0] }
                    },
                    fingerprintVerifications: {
                        $sum: { $cond: [{ $eq: ['$verificationMethod', 'fingerprint'] }, 1, 0] }
                    },
                    bothVerifications: {
                        $sum: { $cond: [{ $eq: ['$verificationMethod', 'both'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAccess: 1,
                    authorizedAccess: 1,
                    unauthorizedAccess: 1,
                    cardOnlyVerifications: 1,
                    fingerprintVerifications: 1,
                    bothVerifications: 1,
                    authorizedPercentage: {
                        $multiply: [
                            { $divide: ['$authorizedAccess', '$totalAccess'] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Get hourly distribution
        const hourlyStats = await AccessLog.aggregate([
            {
                $lookup: {
                    from: 'cards',
                    localField: 'cardId',
                    foreignField: 'id',
                    as: 'card'
                }
            },
            {
                $unwind: '$card'
            },
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: { $hour: '$timestamp' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        res.json({
            summary: stats[0] || {
                totalAccess: 0,
                authorizedAccess: 0,
                unauthorizedAccess: 0,
                cardOnlyVerifications: 0,
                fingerprintVerifications: 0,
                bothVerifications: 0,
                authorizedPercentage: 0
            },
            hourlyDistribution: hourlyStats
        });
    } catch (error) {
        console.error('Error fetching access stats:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router; 