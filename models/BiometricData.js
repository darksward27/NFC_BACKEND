import mongoose from 'mongoose';

const BiometricDataSchema = new mongoose.Schema({
    cardId: { type: String, required: true, unique: true },
    templateData: { type: String, required: true },
    created: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

BiometricDataSchema.index({ fingerprintId: 1 }, { unique: true });

const BiometricData = mongoose.models.BiometricData || mongoose.model('BiometricData', BiometricDataSchema);
export default BiometricData; 