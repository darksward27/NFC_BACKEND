import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['available', 'borrowed'],
        default: 'available'
    }
}, {
    timestamps: true
});

const Book = mongoose.models?.Book ?? mongoose.model('Book', BookSchema);
export default Book; 