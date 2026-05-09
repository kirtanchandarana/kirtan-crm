const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { logActivity } = require('./activities');

// Get all leads
router.get('/', auth, async (req, res) => {
    const selectQuery = `
        SELECT l.*, u.name as assigned_to_name,
        (SELECT COUNT(*) FROM followups WHERE lead_id = l.id) as followups_count,
        (SELECT MAX(followup_date) FROM followups WHERE lead_id = l.id) as last_contact_date
        FROM leads l 
        LEFT JOIN users u ON l.assigned_to = u.id
    `;
    const sql = req.user.role === 'admin' 
        ? `${selectQuery} ORDER BY l.created_at DESC`
        : `${selectQuery} WHERE l.assigned_to = $1 ORDER BY l.created_at DESC`;
    
    const params = req.user.role === 'admin' ? [] : [req.user.id];

    try {
        const { rows } = await db.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create Lead
router.post('/', auth, async (req, res) => {
    const { name, email, phone, source, assigned_to } = req.body;
    try {
        const { rows } = await db.query(
            "INSERT INTO leads (name, email, phone, source, assigned_to) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [name, email, phone, source, assigned_to || req.user.id]
        );
        await logActivity(req.user.id, "Created Lead", `Lead ${name} was added.`);
        res.json({ success: true, id: rows[0].id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Lead Status
router.patch('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query(
            "UPDATE leads SET status = $1 WHERE id = $2",
            [status, req.params.id]
        );
        await logActivity(req.user.id, "Updated Lead Status", `Lead ID ${req.params.id} marked as ${status}.`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Lead
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.query("DELETE FROM leads WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
