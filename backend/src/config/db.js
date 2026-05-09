const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kirtancrm',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const db = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};

async function initializeTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) CHECK(role IN ('admin', 'employee')) DEFAULT 'employee',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            source VARCHAR(100),
            status VARCHAR(50) CHECK(status IN ('New', 'Contacted', 'Qualified', 'Won', 'Lost')) DEFAULT 'New',
            assigned_to INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            company VARCHAR(255),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            due_date DATE,
            status VARCHAR(50) CHECK(status IN ('Pending', 'Completed')) DEFAULT 'Pending',
            assigned_to INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS followups (
            id SERIAL PRIMARY KEY,
            lead_id INTEGER,
            note TEXT,
            followup_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS activity_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            action VARCHAR(255),
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )`
    ];

    try {
        for (let sql of tables) {
            await pool.query(sql);
        }

        // Check if admin exists and ensure password is correct
        const { rows } = await pool.query("SELECT * FROM users WHERE email = 'admin@kirtancrm.com'");
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        
        if (rows.length === 0) {
            await pool.query(
                "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)", 
                ['Admin User', 'admin@kirtancrm.com', hashedPassword, 'admin']
            );
            console.log('Default admin account created: admin@kirtancrm.com / admin123');
        } else {
            // Force update password to ensure it is properly hashed
            // In case it was inserted as plaintext previously or changed
            const admin = rows[0];
            const isMatch = bcrypt.compareSync('admin123', admin.password);
            if (!isMatch) {
                 await pool.query(
                     "UPDATE users SET password = $1 WHERE email = 'admin@kirtancrm.com'",
                     [hashedPassword]
                 );
                 console.log('Admin password updated to properly hashed admin123');
            } else {
                 console.log('Database connected and initialized successfully.');
            }
        }
    } catch (err) {
        console.error('Initialization error:', err.message);
    }
}

initializeTables();

module.exports = db;
