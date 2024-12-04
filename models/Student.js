import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
});

const academicDetailsSchema = new mongoose.Schema({
    cgpa: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    subjects: [{ type: String }]
});

const nfcCardSchema = new mongoose.Schema({
    cardNumber: String,
    issueDate: { type: Date, default: Date.now },
    lastReplaced: Date,
    active: { type: Boolean, default: true }
});

const attendanceSchema = new mongoose.Schema({
    lastTapIn: Date,
    lastTapOut: Date,
    totalPresent: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },
    totalLate: { type: Number, default: 0 },
    status: { type: String, default: 'absent' },
    history: [{
        date: Date,
        status: String,
        tapIn: Date,
        tapOut: Date
    }]
});

const studentSchema = new mongoose.Schema({
    holderName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    type: { type: String, default: 'student' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    active: { type: Boolean, default: true },
    studentInfo: {
        rollNumber: { type: String, required: true, unique: true },
        semester: { type: Number, default: 1 },
        branch: String,
        section: String,
        batch: String,
        admissionYear: Number,
        guardianName: String,
        guardianPhone: String,
        bloodGroup: String,
        address: addressSchema,
        academicDetails: academicDetailsSchema,
        nfcCard: nfcCardSchema,
        attendance: attendanceSchema
    }
}, {
    timestamps: true
});

const Student = mongoose.models?.Student ?? mongoose.model('Student', studentSchema);
export default Student; 