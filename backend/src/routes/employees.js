const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// Get all employees (Admin Only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const { rows } = await db.query("SELECT id, name, email, role, created_at FROM users WHERE role = 'employee'");
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Add Employee (Admin Only)
router.post('/', auth, adminOnly, async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    try {
        const { rows } = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'employee') RETURNING id",
            [name, email, hashedPassword]
        );
        res.json({ success: true, id: rows[0].id });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Email already exists or database error' });
    }
});

// Delete Employee (Admin Only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await db.query("DELETE FROM users WHERE id = $1 AND role = 'employee'", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
