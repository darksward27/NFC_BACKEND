import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    holderName: { type: String, required: true },
    biometricId: { type: mongoose.Schema.Types.ObjectId, ref: 'BiometricData' },
    fingerprintId: { type: Number, required: true },
    type: { type: String, enum: ['student', 'faculty', 'staff', 'employee', 'visitor'], required: true },
    email: String,
    phone: String,
    active: {
        type: Boolean,
        default: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: Date
});

CardSchema.index({ id: 1 }, { unique: true });
CardSchema.index({ fingerprintId: 1 }, { unique: true });

const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
export default Card; 