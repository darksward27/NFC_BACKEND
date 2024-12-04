import mongoose from 'mongoose';

const PendingRegistrationSchema = new mongoose.Schema({
    cardId: { type: String, required: true },
    fingerprintId: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    deviceId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
});

PendingRegistrationSchema.index({ cardId: 1, fingerprintId: 1 }, { unique: true });

const PendingRegistration = mongoose.models.PendingRegistration || 
    mongoose.model('PendingRegistration', PendingRegistrationSchema);
export default PendingRegistration; 