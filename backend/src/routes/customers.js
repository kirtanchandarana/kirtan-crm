const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { logActivity } = require('./activities');

// Get all customers
router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM customers ORDER BY created_at DESC");
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create Customer
router.post('/', auth, async (req, res) => {
    const { name, email, phone, company, address } = req.body;
    try {
        const { rows } = await db.query(
            "INSERT INTO customers (name, email, phone, company, address) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [name, email, phone, company, address]
        );
        await logActivity(req.user.id, "Created Customer", `Customer ${name} was added.`);
        res.json({ success: true, id: rows[0].id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Customer
router.put('/:id', auth, async (req, res) => {
    const { name, email, phone, company, address } = req.body;
    try {
        await db.query(
            "UPDATE customers SET name = $1, email = $2, phone = $3, company = $4, address = $5 WHERE id = $6",
            [name, email, phone, company, address, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Customer
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.query("DELETE FROM customers WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get Customer Timeline
router.get('/:id/timeline', auth, async (req, res) => {
    try {
        const { rows: customerRows } = await db.query("SELECT * FROM customers WHERE id = $1", [req.params.id]);
        const customer = customerRows[0];
        
        if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

        const timeline = [];
        
        // 1. Customer Added
        timeline.push({
            id: `c-${customer.id}`,
            type: 'customer_added',
            title: 'Customer Added',
            description: `${customer.name} was added to the system.`,
            date: customer.created_at,
            icon: 'Users'
        });

        const promises = [];

        // 2. Fetch Lead status updates and Followups if they were a lead
        if (customer.email) {
            promises.push(
                db.query("SELECT id FROM leads WHERE email = $1", [customer.email]).then(async (leadRes) => {
                    const lead = leadRes.rows[0];
                    if (lead) {
                        const [followupsRes, logsRes] = await Promise.all([
                            db.query("SELECT * FROM followups WHERE lead_id = $1", [lead.id]),
                            db.query("SELECT * FROM activity_logs WHERE action = 'Updated Lead Status' AND details ILIKE $1", [`%Lead ID ${lead.id}%`])
                        ]);

                        followupsRes.rows.forEach(f => {
                            timeline.push({
                                id: `f-${f.id}`,
                                type: 'followup',
                                title: 'Followup Logged',
                                description: f.note,
                                date: f.created_at,
                                icon: 'MessageCircle'
                            });
                        });

                        logsRes.rows.forEach(log => {
                            timeline.push({
                                id: `l-${log.id}`,
                                type: 'status_update',
                                title: 'Lead Status Changed',
                                description: log.details,
                                date: log.created_at,
                                icon: 'Target'
                            });
                        });
                    }
                })
            );
        }

        // 3. Fetch Tasks related to this customer
        const taskSearch = `%${customer.name}%`;
        promises.push(
            db.query("SELECT * FROM tasks WHERE title ILIKE $1 OR description ILIKE $1", [taskSearch]).then(tasksRes => {
                tasksRes.rows.forEach(t => {
                    timeline.push({
                        id: `t-${t.id}`,
                        type: 'task',
                        title: `Task: ${t.title}`,
                        description: t.description || 'No description',
                        date: t.created_at,
                        icon: 'CheckSquare'
                    });
                });
            })
        );

        // 4. Activity logs for their name
        const logSearch = `%${customer.name}%`;
        promises.push(
            db.query("SELECT * FROM activity_logs WHERE details ILIKE $1 AND action != 'Updated Lead Status'", [logSearch]).then(logsRes => {
                logsRes.rows.forEach(log => {
                    if (log.action === 'Created Customer' || log.action === 'Created Lead') return;
                    timeline.push({
                        id: `a-${log.id}`,
                        type: 'activity',
                        title: log.action,
                        description: log.details,
                        date: log.created_at,
                        icon: 'Activity'
                    });
                });
            })
        );

        await Promise.all(promises);

        timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ success: true, data: timeline });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
