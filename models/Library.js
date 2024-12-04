import mongoose from 'mongoose';

const LibrarySchema = new mongoose.Schema({
    name: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    location: String,
    capacity: Number,
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Library = mongoose.models?.Library ?? mongoose.model('Library', LibrarySchema);
export default Library; 