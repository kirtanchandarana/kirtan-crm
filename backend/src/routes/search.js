const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json({ success: true, results: [] });

    const searchStr = `%${query}%`;
    const results = [];
    
    try {
        const [customers, leads, tasks, employees] = await Promise.all([
            db.query("SELECT id, name, email, 'customer' as type FROM customers WHERE name ILIKE $1 OR email ILIKE $2 LIMIT 5", [searchStr, searchStr]),
            db.query("SELECT id, name, email, 'lead' as type FROM leads WHERE name ILIKE $1 OR email ILIKE $2 LIMIT 5", [searchStr, searchStr]),
            db.query("SELECT id, title as name, description as email, 'task' as type FROM tasks WHERE title ILIKE $1 OR description ILIKE $2 LIMIT 5", [searchStr, searchStr]),
            db.query("SELECT id, name, email, 'employee' as type FROM users WHERE name ILIKE $1 OR email ILIKE $2 LIMIT 5", [searchStr, searchStr])
        ]);

        if (customers.rows) results.push(...customers.rows);
        if (leads.rows) results.push(...leads.rows);
        if (tasks.rows) results.push(...tasks.rows);
        if (employees.rows) results.push(...employees.rows);

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
