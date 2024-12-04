import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    isRegistrationMode: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
}, {
    timestamps: true
});

DeviceSchema.index({ deviceId: 1 }, { unique: true });

const Device = mongoose.models?.Device ?? mongoose.model('Device', DeviceSchema);
export default Device; 