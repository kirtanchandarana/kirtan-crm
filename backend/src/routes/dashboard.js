const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;
    const stats = {};

    try {
        const [customersRes, leadsRes, tasksRes, chartRes] = await Promise.all([
            db.query("SELECT COUNT(*) as count FROM customers"),
            isAdmin 
                ? db.query("SELECT COUNT(*) as count FROM leads")
                : db.query("SELECT COUNT(*) as count FROM leads WHERE assigned_to = $1", [userId]),
            isAdmin 
                ? db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending'")
                : db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending' AND assigned_to = $1", [userId]),
            isAdmin 
                ? db.query("SELECT status, COUNT(*) as count FROM leads GROUP BY status")
                : db.query("SELECT status, COUNT(*) as count FROM leads WHERE assigned_to = $1 GROUP BY status", [userId])
        ]);

        stats.totalCustomers = customersRes.rows[0] ? parseInt(customersRes.rows[0].count) : 0;
        stats.totalLeads = leadsRes.rows[0] ? parseInt(leadsRes.rows[0].count) : 0;
        stats.pendingTasks = tasksRes.rows[0] ? parseInt(tasksRes.rows[0].count) : 0;
        stats.leadDistribution = chartRes.rows || [];

        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/insights', auth, async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;
    const insights = {};

    try {
        const overdueFollowupsSql = isAdmin ? 
            "SELECT COUNT(*) as count FROM followups WHERE followup_date < CURRENT_DATE" : 
            "SELECT COUNT(*) as count FROM followups f JOIN leads l ON f.lead_id = l.id WHERE f.followup_date < CURRENT_DATE AND l.assigned_to = $1";
        
        const bestSourceSql = isAdmin ? 
            "SELECT source, COUNT(*) as count FROM leads WHERE status = 'Won' GROUP BY source ORDER BY count DESC LIMIT 1" : 
            "SELECT source, COUNT(*) as count FROM leads WHERE status = 'Won' AND assigned_to = $1 GROUP BY source ORDER BY count DESC LIMIT 1";

        const topEmployeeSql = "SELECT u.name, COUNT(l.id) as count FROM users u JOIN leads l ON u.id = l.assigned_to WHERE l.status = 'Won' GROUP BY u.id, u.name ORDER BY count DESC LIMIT 1";

        const inactiveLeadsSql = isAdmin ? 
            "SELECT COUNT(*) as count FROM leads WHERE id NOT IN (SELECT lead_id FROM followups WHERE followup_date > CURRENT_DATE - INTERVAL '30 days')" : 
            "SELECT COUNT(*) as count FROM leads WHERE assigned_to = $1 AND id NOT IN (SELECT lead_id FROM followups WHERE followup_date > CURRENT_DATE - INTERVAL '30 days')";

        const params = isAdmin ? [] : [userId];

        const [overdueRes, bestSourceRes, topEmpRes, inactiveRes] = await Promise.all([
            db.query(overdueFollowupsSql, params),
            db.query(bestSourceSql, params),
            db.query(topEmployeeSql),
            db.query(inactiveLeadsSql, params)
        ]);

        insights.overdueFollowups = overdueRes.rows[0] ? parseInt(overdueRes.rows[0].count) : 0;
        insights.bestLeadSource = bestSourceRes.rows[0] ? bestSourceRes.rows[0].source : 'N/A';
        insights.topEmployee = topEmpRes.rows[0] ? topEmpRes.rows[0].name : 'N/A';
        insights.inactiveLeads = inactiveRes.rows[0] ? parseInt(inactiveRes.rows[0].count) : 0;

        res.json({ success: true, data: insights });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/notifications', auth, async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;
    const notifications = [];

    try {
        const pendingFollowupsSql = isAdmin ? 
            "SELECT f.id, l.name as lead_name, f.followup_date FROM followups f JOIN leads l ON f.lead_id = l.id WHERE f.followup_date >= CURRENT_DATE AND f.followup_date <= CURRENT_DATE + INTERVAL '7 days' LIMIT 5" : 
            "SELECT f.id, l.name as lead_name, f.followup_date FROM followups f JOIN leads l ON f.lead_id = l.id WHERE f.followup_date >= CURRENT_DATE AND f.followup_date <= CURRENT_DATE + INTERVAL '7 days' AND l.assigned_to = $1 LIMIT 5";
        
        const overdueTasksSql = isAdmin ? 
            "SELECT id, title, due_date FROM tasks WHERE status = 'Pending' AND due_date < CURRENT_DATE LIMIT 5" : 
            "SELECT id, title, due_date FROM tasks WHERE status = 'Pending' AND due_date < CURRENT_DATE AND assigned_to = $1 LIMIT 5";

        const uncontactedSql = isAdmin ? 
            "SELECT id, name FROM leads WHERE id NOT IN (SELECT lead_id FROM followups WHERE followup_date > CURRENT_DATE - INTERVAL '7 days') AND status NOT IN ('Won', 'Lost') LIMIT 5" : 
            "SELECT id, name FROM leads WHERE assigned_to = $1 AND id NOT IN (SELECT lead_id FROM followups WHERE followup_date > CURRENT_DATE - INTERVAL '7 days') AND status NOT IN ('Won', 'Lost') LIMIT 5";

        const params = isAdmin ? [] : [userId];

        const [followupsRes, tasksRes, uncontactedRes, customersRes] = await Promise.all([
            db.query(pendingFollowupsSql, params),
            db.query(overdueTasksSql, params),
            db.query(uncontactedSql, params),
            db.query("SELECT id, name, created_at FROM customers ORDER BY created_at DESC LIMIT 5")
        ]);

        followupsRes.rows.forEach(r => notifications.push({ id: `f-${r.id}`, type: 'followup', message: `Pending followup with ${r.lead_name}`, date: r.followup_date }));
        tasksRes.rows.forEach(r => notifications.push({ id: `t-${r.id}`, type: 'task_overdue', message: `Overdue task: ${r.title}`, date: r.due_date }));
        uncontactedRes.rows.forEach(r => notifications.push({ id: `l-${r.id}`, type: 'lead_stale', message: `Lead not contacted > 7 days: ${r.name}`, date: new Date().toISOString() }));
        customersRes.rows.forEach(r => notifications.push({ id: `c-${r.id}`, type: 'new_customer', message: `New customer added: ${r.name}`, date: r.created_at }));
        
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
