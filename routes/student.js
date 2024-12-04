import express from 'express';
import { Student, Card } from '../models/index.js';
import { broadcast } from '../utils/websocket.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
    try {
        const { departmentId, status } = req.query;
        let query = { type: 'student' };

        if (departmentId) query.departmentId = departmentId;
        if (status) query.active = status === 'active';

        const students = await Student.find(query)
            .populate('departmentId')
            .populate('organizationId')
            .sort({ holderName: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Create new student
router.post('/', async (req, res) => {
    try {
        console.log('Received create request with data:', req.body);

        // Validate required fields
        const requiredFields = ['holderName', 'email', 'phone', 'studentInfo.rollNumber'];
        const missingFields = requiredFields.filter(field => {
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return !req.body[parent]?.[child];
            }
            return !req.body[field];
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields
            });
        }

        // Get the latest fingerprintId
        const latestCard = await Card.findOne({ type: 'student' })
            .sort({ fingerprintId: -1 })
            .limit(1);
        
        const nextFingerprintId = latestCard ? (latestCard.fingerprintId + 1) : 1;

        // Create card with explicit active field
        const cardData = {
            id: req.body.studentInfo.rollNumber,
            organizationId: req.body.organizationId,
            departmentId: req.body.departmentId,
            holderName: req.body.holderName,
            fingerprintId: nextFingerprintId,
            type: 'student',
            email: req.body.email,
            phone: req.body.phone,
            active: true, // Explicit active field
            issueDate: new Date(),
            expiryDate: req.body.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        };

        console.log('Creating card with data:', cardData);
        const newCard = await Card.create(cardData);
        console.log('Card created:', newCard);

        // Create student with explicit active field
        const studentData = {
            holderName: req.body.holderName,
            email: req.body.email,
            phone: req.body.phone,
            type: 'student',
            departmentId: req.body.departmentId,
            organizationId: req.body.organizationId,
            validFrom: req.body.validFrom || new Date(),
            validUntil: req.body.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            active: true, // Explicit active field
            studentInfo: {
                rollNumber: req.body.studentInfo.rollNumber,
                semester: req.body.studentInfo.semester || 1,
                branch: req.body.studentInfo.branch || '',
                section: req.body.studentInfo.section || '',
                batch: req.body.studentInfo.batch || new Date().getFullYear().toString(),
                admissionYear: req.body.studentInfo.admissionYear || new Date().getFullYear(),
                guardianName: req.body.studentInfo.guardianName || '',
                guardianPhone: req.body.studentInfo.guardianPhone || '',
                bloodGroup: req.body.studentInfo.bloodGroup || '',
                address: req.body.studentInfo.address || {},
                academicDetails: req.body.studentInfo.academicDetails || {},
                nfcCard: {
                    cardNumber: req.body.studentInfo.rollNumber,
                    issueDate: new Date(),
                    lastReplaced: null,
                    active: true // Explicit active field
                }
            }
        };

        console.log('Creating student with data:', studentData);
        const newStudent = await Student.create(studentData);
        console.log('Student created:', newStudent);

        // Populate and return the result
        const populatedStudent = await Student.findById(newStudent._id)
            .populate('departmentId')
            .populate('organizationId');

        const result = {
            ...newCard.toObject(),
            studentInfo: populatedStudent.studentInfo,
            active: true // Explicit active field in response
        };

        res.status(201).json(result);

    } catch (error) {
        console.error('Create operation failed:', error);
        console.error('Full error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'A student with this roll number already exists',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to create student and card',
            message: error.message,
            details: error.stack
        });
    }
});

// Update student
router.put('/roll/:rollNumber', async (req, res) => {
    try {
        const { rollNumber } = req.params;
        const updates = req.body;
        
        console.log('Update request for roll number:', rollNumber);
        console.log('Active status from request:', updates.active);

        // Create the card data with active field
        const cardData = {
            id: updates.studentInfo.rollNumber,
            organizationId: updates.organizationId,
            departmentId: updates.departmentId,
            holderName: updates.holderName,
            type: 'student',
            email: updates.email,
            phone: updates.phone,
            active: Boolean(updates.active),
            expiryDate: updates.validUntil
        };

        // Create the student data
        const studentData = {
            holderName: updates.holderName,
            email: updates.email,
            phone: updates.phone,
            type: 'student',
            departmentId: updates.departmentId,
            organizationId: updates.organizationId,
            validFrom: updates.validFrom,
            validUntil: updates.validUntil,
            active: Boolean(updates.active),
            studentInfo: {
                ...updates.studentInfo,
                nfcCard: {
                    ...updates.studentInfo.nfcCard,
                    active: Boolean(updates.active)
                }
            }
        };

        // Find and update both documents
        const [existingStudent, existingCard] = await Promise.all([
            Student.findOne({ 'studentInfo.rollNumber': rollNumber }),
            Card.findOne({ id: rollNumber })
        ]);

        if (!existingStudent || !existingCard) {
            return res.status(404).json({
                error: 'Student or Card not found'
            });
        }

        // Update both documents
        const [updatedStudent, updatedCard] = await Promise.all([
            Student.findByIdAndUpdate(
                existingStudent._id,
                { $set: studentData },
                { new: true }
            ).populate('departmentId').populate('organizationId'),
            
            Card.findByIdAndUpdate(
                existingCard._id,
                { $set: cardData },
                { new: true }
            ).populate('departmentId').populate('organizationId')
        ]);

        if (!updatedStudent || !updatedCard) {
            throw new Error('Failed to update one or both records');
        }

        // Return the merged response
        const result = {
            ...updatedCard.toObject(),
            studentInfo: updatedStudent.studentInfo,
            active: updatedStudent.active
        };

        res.json(result);

    } catch (error) {
        console.error('Update operation failed:', error);
        res.status(500).json({
            error: 'Failed to update student and card',
            message: error.message
        });
    }
});

// Delete student
router.delete('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        console.log('Delete request for identifier:', identifier);

        if (!identifier) {
            return res.status(400).json({
                error: 'No identifier provided'
            });
        }

        // Delete student and card documents
        const [studentResult, cardResult] = await Promise.all([
            Student.deleteOne({ 'studentInfo.rollNumber': identifier }),
            Card.deleteOne({ id: identifier })
        ]);

        console.log('Delete results:', {
            student: studentResult,
            card: cardResult
        });

        // Check if anything was deleted
        if (studentResult.deletedCount === 0 && cardResult.deletedCount === 0) {
            return res.status(404).json({
                error: 'No records found for the given identifier'
            });
        }

        res.json({
            message: 'Delete operation completed successfully',
            studentDeleted: studentResult.deletedCount > 0,
            cardDeleted: cardResult.deletedCount > 0
        });

    } catch (error) {
        console.error('Delete operation failed:', error);
        res.status(500).json({
            error: 'Failed to delete student',
            message: error.message
        });
    }
});

export default router; 