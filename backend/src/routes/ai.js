const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// Helper to simulate slight delay for AI feeling
const simulateAI = (fn) => new Promise((resolve) => setTimeout(() => resolve(fn()), 600));

// 1. AI Email Writer
router.post('/email-writer', auth, async (req, res) => {
    const { type, context } = req.body;
    let emailContent = "";

    const result = await simulateAI(() => {
        if (type === 'welcome') {
            return `Subject: Welcome to Kirtan CRM!\n\nHi ${context.name || 'there'},\n\nWe are thrilled to have you on board. Let me know if you need any help setting things up.\n\nBest,\nYour Name`;
        } else if (type === 'followup') {
            return `Subject: Following up on our last conversation\n\nHi ${context.name || 'there'},\n\nJust checking in to see if you had any further questions about our services. Let's reconnect soon!\n\nBest,\nYour Name`;
        } else if (type === 'payment') {
            return `Subject: Payment Reminder - Invoice Overdue\n\nHi ${context.name || 'there'},\n\nThis is a gentle reminder that your recent invoice is overdue. Please process it at your earliest convenience.\n\nThank you,\nYour Name`;
        } else if (type === 'meeting') {
            return `Subject: Request for a Quick Meeting\n\nHi ${context.name || 'there'},\n\nI'd love to schedule a quick 15-minute call this week to discuss how we can help you further. Let me know what time works best.\n\nBest,\nYour Name`;
        }
        return `Hello ${context.name || 'there'},\n\nHope you are doing well.\n\nBest,\nYour Name`;
    });

    res.json({ success: true, content: result });
});

// 2. AI Notes Summarizer
router.post('/summarize', auth, async (req, res) => {
    const { notes } = req.body;
    
    const summary = await simulateAI(() => {
        if (!notes || notes.length < 20) return notes;
        const keywords = notes.split(' ').filter(w => w.length > 5).slice(0, 4).join(', ');
        return `Key takeaways: Discussed ${keywords}. Client seems interested. Follow up required.`;
    });

    res.json({ success: true, summary });
});

// 3. AI Priority Engine
router.get('/priorities', auth, async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    try {
        const leadSql = isAdmin ? 
            "SELECT * FROM leads WHERE status NOT IN ('Won', 'Lost') ORDER BY created_at DESC LIMIT 1" : 
            "SELECT * FROM leads WHERE status NOT IN ('Won', 'Lost') AND assigned_to = $1 ORDER BY created_at DESC LIMIT 1";

        const taskSql = isAdmin ? 
            "SELECT * FROM tasks WHERE status = 'Pending' ORDER BY due_date ASC LIMIT 1" : 
            "SELECT * FROM tasks WHERE status = 'Pending' AND assigned_to = $1 ORDER BY due_date ASC LIMIT 1";

        const params = isAdmin ? [] : [userId];

        const [leadRes, customerRes, taskRes] = await Promise.all([
            db.query(leadSql, params),
            db.query("SELECT * FROM customers ORDER BY created_at ASC LIMIT 1"),
            db.query(taskSql, params)
        ]);

        const priorityData = {
            contact_first_lead: leadRes.rows[0] || null,
            inactive_customer: customerRes.rows[0] || null,
            urgent_task: taskRes.rows[0] || null
        };

        res.json({ success: true, data: priorityData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. AI Insights
router.get('/insights', auth, async (req, res) => {
    const insights = await simulateAI(() => [
        "Leads from 'Website' have a 20% higher conversion rate.",
        "You have 3 tasks overdue. Consider delegating.",
        "Tuesday is your best day for reaching new leads.",
        "Consider sending a follow-up email to 'Cold' leads."
    ]);
    res.json({ success: true, insights });
});

module.exports = router;
