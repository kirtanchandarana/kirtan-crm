require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Route Imports
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const customerRoutes = require('./routes/customers');
const taskRoutes = require('./routes/tasks');
const employeeRoutes = require('./routes/employees');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const searchRoutes = require('./routes/search');
const { router: activityRoutes } = require('./routes/activities');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activities', activityRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy. Trying ${parseInt(PORT) + 1}...`);
        app.listen(parseInt(PORT) + 1);
    } else {
        console.error(err);
    }
});
