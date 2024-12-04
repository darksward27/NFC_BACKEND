import mongoose from 'mongoose';

const BookLoanSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    checkoutTime: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnTime: Date,
    status: {
        type: String,
        enum: ['active', 'returned'],
        default: 'active'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }
}, {
    timestamps: true
});

const BookLoan = mongoose.models?.BookLoan ?? mongoose.model('BookLoan', BookLoanSchema);
export default BookLoan; 