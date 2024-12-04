import express from 'express';
import { Organization, Department, Card } from '../models/index.js';
import { broadcast } from '../utils/websocket.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const organizations = await Organization.find({}).sort({ name: 1 });
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
});

router.post('/', async (req, res) => {
    try {
        const organization = new Organization(req.body);
        await organization.save();
        broadcast({ type: 'organizationAdded', organization });
        res.status(201).json(organization);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create organization' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        broadcast({ type: 'organizationUpdated', organization });
        res.json(organization);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update organization' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const organization = await Organization.findByIdAndDelete(req.params.id);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const departments = await Department.find({ organizationId: req.params.id });
        const departmentIds = departments.map(dept => dept._id);

        await Department.deleteMany({ organizationId: req.params.id });
        await Card.deleteMany({ departmentId: { $in: departmentIds } });

        broadcast({ type: 'organizationDeleted', id: req.params.id });
        res.json({ message: 'Organization and associated data deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete organization' });
    }
});

export default router; 