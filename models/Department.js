import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    description: String,
    location: String,
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now }
});

const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
export default Department;