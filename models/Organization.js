import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['university', 'company'], required: true },
    address: String,
    contactEmail: String,
    contactPhone: String,
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Organization = mongoose.models?.Organization ?? mongoose.model('Organization', OrganizationSchema);
export default Organization; 