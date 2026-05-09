import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import CustomerTimeline from './pages/CustomerTimeline';
import Tasks from './pages/Tasks';
import Employees from './pages/Employees';
import ActivityLogs from './pages/ActivityLogs';
import SmartHub from './pages/SmartHub';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen dark:bg-slate-900">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id/timeline" element={<CustomerTimeline />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="smarthub" element={<SmartHub />} />
            <Route path="employees" element={
              <ProtectedRoute adminOnly={true}>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="activity-logs" element={
              <ProtectedRoute adminOnly={true}>
                <ActivityLogs />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
