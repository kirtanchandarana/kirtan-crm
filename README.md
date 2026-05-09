# Kirtan CRM - Premium Business Management

A complete CRM solution built with React, Node.js, and SQLite. Perfect for college projects and small businesses.

## Features
- **Secure Authentication**: JWT-based login for Admins and Employees.
- **Dynamic Dashboard**: Real-time stats and lead distribution charts.
- **Lead Management**: Full CRUD operations with status tracking (New, Won, Lost, etc.).
- **Customer Directory**: Centralized database for client information.
- **Task Tracking**: Stay organized with task status and due dates.
- **Role-Based Access**: Admins can manage employees; employees see their assigned work.
- **Zero-Setup Database**: Uses SQLite (no MySQL/PostgreSQL installation required).

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, SQLite3, JWT, Bcrypt.

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*The server will start on port 5000 and automatically create `crm.db` with an admin account.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The app will start on port 3000.*

## Default Credentials
- **Email**: `admin@kirtancrm.com`
- **Password**: `admin123`

## Project Structure
- `/backend`: Express API and SQLite configuration.
- `/frontend`: React application with Tailwind CSS.
- `/database`: Contains `crm.db` (auto-created).
- `/docs`: Project documentation.
