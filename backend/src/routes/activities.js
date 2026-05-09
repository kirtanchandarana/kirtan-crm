const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// Get all activities
router.get('/', auth, async (req, res) => {
    try {
        const sql = req.user.role === 'admin' 
            ? "SELECT a.*, u.name as user_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 50"
            : "SELECT a.*, u.name as user_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id WHERE a.user_id = $1 ORDER BY a.created_at DESC LIMIT 50";
        
        const params = req.user.role === 'admin' ? [] : [req.user.id];

        const { rows } = await db.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Helper function to log activities (not a route, but exposed to other files)
const logActivity = async (userId, action, details) => {
    try {
        await db.query(
            "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
            [userId, action, details]
        );
    } catch (err) {
        console.error("Error logging activity:", err.message);
    }
};

module.exports = { router, logActivity };
