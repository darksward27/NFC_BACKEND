import mongoose from 'mongoose';

const AccessLogSchema = new mongoose.Schema({
    deviceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Device', 
        required: true 
    },
    cardId: { 
        type: String,
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    authorized: { 
        type: Boolean, 
        required: true 
    },
    verificationMethod: { 
        type: String, 
        enum: ['card', 'fingerprint', 'both'],
        required: true 
    },
    location: String,
    reason: String,
    fingerprintId: Number
}, {
    timestamps: true
});

// Indexes for faster queries
AccessLogSchema.index({ timestamp: -1 });
AccessLogSchema.index({ deviceId: 1, timestamp: -1 });
AccessLogSchema.index({ cardId: 1, timestamp: -1 });
AccessLogSchema.index({ authorized: 1, timestamp: -1 });

const AccessLog = mongoose.models?.AccessLog ?? mongoose.model('AccessLog', AccessLogSchema);
export default AccessLog; 