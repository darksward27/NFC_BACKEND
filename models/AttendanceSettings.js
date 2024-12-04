import mongoose from 'mongoose';

const AttendanceSettingsSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    workDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    workHours: {
        start: {
            type: String,
            default: '09:00'
        },
        end: {
            type: String,
            default: '17:00'
        }
    },
    graceTime: {
        type: Number,
        default: 15
    }
}, {
    timestamps: true
});

const AttendanceSettings = mongoose.models?.AttendanceSettings || mongoose.model('AttendanceSettings', AttendanceSettingsSchema);
export default AttendanceSettings; 