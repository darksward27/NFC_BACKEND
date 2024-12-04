import express from 'express';
import { AccessLog, Card } from '../models/index.js';

const router = express.Router();

router.get('/access-stats', async (req, res) => {
    try {
        const { organizationId, departmentId, startDate, endDate } = req.query;
        
        let matchQuery = {};
        
        if (startDate || endDate) {
            matchQuery.timestamp = {};
            if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
            if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
        }

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
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAccess: 1,
                    authorizedAccess: 1,
                    unauthorizedAccess: 1,
                    authorizedPercentage: {
                        $multiply: [
                            { $divide: ['$authorizedAccess', '$totalAccess'] },
                            100
                        ]
                    }
                }
            }
        ]);

        const hourlyStats = await AccessLog.aggregate([
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