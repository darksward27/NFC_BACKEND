import express from 'express';
import { BookLoan, Book, Faculty } from '../models/index.js';

const router = express.Router();

// Get all book loans with faculty info
router.get('/', async (req, res) => {
    try {
        const loans = await BookLoan.find()
            .populate('bookId')
            .populate({
                path: 'facultyId',
                select: 'personalInfo.firstName personalInfo.lastName employmentDetails.department'
            })
            .populate('departmentId')
            .sort({ checkoutTime: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book loans' });
    }
});

// Create a new book loan
router.post('/checkout', async (req, res) => {
    try {
        const { bookId, facultyId, dueDate } = req.body;

        // Check if book exists and is available
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (book.status !== 'available') {
            return res.status(400).json({ error: 'Book is not available' });
        }

        // Verify faculty exists
        const faculty = await Faculty.findById(facultyId);
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Create loan record
        const loan = new BookLoan({
            bookId,
            facultyId,
            dueDate: new Date(dueDate),
            departmentId: faculty.employmentDetails.department,
            status: 'active'
        });

        // Update book status
        book.status = 'borrowed';

        await Promise.all([
            loan.save(),
            book.save()
        ]);

        await loan.populate([
            'bookId',
            {
                path: 'facultyId',
                select: 'personalInfo.firstName personalInfo.lastName employmentDetails.department'
            },
            'departmentId'
        ]);

        res.status(201).json(loan);
    } catch (error) {
        console.error('Error creating loan:', error);
        res.status(500).json({ error: 'Failed to checkout book' });
    }
});

// Return a book
router.put('/:id/return', async (req, res) => {
    try {
        const loan = await BookLoan.findById(req.params.id)
            .populate('bookId')
            .populate('facultyId');

        if (!loan) {
            return res.status(404).json({ error: 'Loan record not found' });
        }

        loan.returnTime = new Date();
        loan.status = 'returned';

        // Update book status
        const book = await Book.findById(loan.bookId);
        if (book) {
            book.status = 'available';
            await book.save();
        }

        await loan.save();
        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to return book' });
    }
});

export default router; 