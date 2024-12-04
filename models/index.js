import mongoose from 'mongoose';
import './AccessLog.js';
import './BiometricData.js';
import './Book.js';
import './Card.js';
import './Department.js';
import './Device.js';
import './Faculty.js';
import './Library.js';
import './Organization.js';
import './PendingRegistration.js';
import './BookLoan.js';
import './Attendance.js';
import './Student.js';

export const {
    AccessLog,
    BiometricData,
    Book,
    Card,
    Department,
    Device,
    Faculty,
    Library,
    Organization,
    PendingRegistration,
    BookLoan,
    AttendanceSettings,
    Attendance,
    Student
} = mongoose.models;

mongoose.set('strictQuery', true);

export default mongoose; 