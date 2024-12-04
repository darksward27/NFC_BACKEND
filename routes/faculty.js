import express from 'express';
import Faculty from '../models/Faculty.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all faculty
router.get('/', async (req, res) => {
    try {
        const { departmentId, status, search } = req.query;
        let query = {};

        if (departmentId) {
            query['employmentDetails.department'] = departmentId;
        }
        if (status) {
            query['employmentDetails.status'] = status;
        }
        if (search) {
            query.$or = [
                { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
                { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
                { 'personalInfo.email': { $regex: search, $options: 'i' } },
                { 'employmentDetails.employeeId': { $regex: search, $options: 'i' } }
            ];
        }

        const faculty = await Faculty.find(query)
            .populate('employmentDetails.department')
            .sort('personalInfo.firstName');
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
});

// Get faculty by department
router.get('/department/:departmentId', async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({ error: 'Invalid department ID' });
        }

        const faculty = await Faculty.find({ 
            'employmentDetails.department': departmentId 
        })
        .populate('employmentDetails.department')
        .populate('organizationId')
        .sort({ 'personalInfo.firstName': 1 });
        
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
});

// Create new faculty member
router.post('/', async (req, res) => {
    try {
        const faculty = new Faculty(req.body);
        await faculty.save();
        await faculty.populate('employmentDetails.department organizationId');
        res.status(201).json(faculty);
    } catch (error) {
        console.error('Error creating faculty:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({ 
                error: `A faculty member with this ${field} already exists` 
            });
        } else {
            res.status(500).json({ error: 'Failed to create faculty member' });
        }
    }
});

// Update faculty member
router.put('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                'employmentDetails.department': req.body.departmentId
            },
            { new: true, runValidators: true }
        ).populate('employmentDetails.department');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete faculty member
router.delete('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ message: 'Failed to delete faculty member' });
    }
});

export default router; 