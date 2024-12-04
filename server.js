// File: server.js
import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import multer from 'multer';
import { AccessLog } from './models/index.js';

// Import routes
import facultyRoutes from './routes/faculty.js';
import attendanceRoutes from './routes/attendance.js';
import classRoutes from './routes/classes.js';
import attendanceSettingsRoutes from './routes/attendanceSettings.js';
import libraryRoutes from './routes/library.js';
import bookRoutes from './routes/books.js';
import deviceRoutes from './routes/devices.js';
import organizationRoutes from './routes/organization.js';
import departmentRoutes from './routes/department.js';
import cardRoutes from './routes/cards.js';
import biometricRoutes from './routes/biometric.js';
import accessLogRoutes from './routes/accessLog.js';
import bookLoansRoutes from './routes/bookLoans.js';
import statsRoutes from './routes/stats.js';
import { initializeWebSocket } from './utils/websocket.js';
import studentRouter from './routes/student.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
initializeWebSocket(server);

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Mount routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance/settings', attendanceSettingsRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/biometric', biometricRoutes);
app.use('/api', accessLogRoutes);
app.use('/api/book-loans', bookLoansRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/students', studentRouter);

// ... previous imports and middleware ...

// Mount routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/settings', attendanceSettingsRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/biometric', biometricRoutes);
app.use('/api/access-logs', accessLogRoutes);

// Access statistics endpoint - exactly as it was before
app.get('/api/access-stats', async (req, res) => {
    try {
        const stats = await AccessLog.aggregate([
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: {
                    path: '$department',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$department.name',
                    total: { $sum: 1 },
                    authorized: {
                        $sum: { $cond: [{ $eq: ['$authorized', true] }, 1, 0] }
                    },
                    unauthorized: {
                        $sum: { $cond: [{ $eq: ['$authorized', false] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch access statistics' });
    }
});

// Error Handling Middleware - exactly as it was before
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ... rest of the server code (MongoDB connection, etc.) ...


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
} catch (err) {
    console.error('MongoDB connection error:', err);
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default { app, server };
