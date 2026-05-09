const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { logActivity } = require('./activities');

// Get all tasks
router.get('/', auth, async (req, res) => {
    const sql = req.user.role === 'admin' 
        ? "SELECT t.*, u.name as assigned_to_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id ORDER BY t.due_date ASC"
        : "SELECT t.*, u.name as assigned_to_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.assigned_to = $1 ORDER BY t.due_date ASC";
    
    const params = req.user.role === 'admin' ? [] : [req.user.id];

    try {
        const { rows } = await db.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create Task
router.post('/', auth, async (req, res) => {
    const { title, description, due_date, assigned_to } = req.body;
    try {
        const { rows } = await db.query(
            "INSERT INTO tasks (title, description, due_date, assigned_to) VALUES ($1, $2, $3, $4) RETURNING id",
            [title, description, due_date, assigned_to || req.user.id]
        );
        await logActivity(req.user.id, "Created Task", `Task "${title}" was created.`);
        res.json({ success: true, id: rows[0].id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Task Status
router.patch('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query(
            "UPDATE tasks SET status = $1 WHERE id = $2",
            [status, req.params.id]
        );
        await logActivity(req.user.id, "Updated Task Status", `Task ID ${req.params.id} marked as ${status}.`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
