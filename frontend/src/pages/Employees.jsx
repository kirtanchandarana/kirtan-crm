import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  Calendar,
  Lock,
  X
} from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/employees', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee account?')) {
      try {
        await axios.delete(`/api/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert('Error deleting employee');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Employee Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Manage team members and access levels</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary px-6 py-3 flex items-center justify-center gap-2"
        >
          <UserPlus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : employees.map((emp) => (
          <div key={emp.id} className="card-hover p-6 relative group overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-tl from-slate-100 to-transparent dark:from-slate-700/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <button 
              onClick={() => handleDelete(emp.id)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex flex-col items-center text-center mb-6 relative z-10">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border border-slate-200/60 dark:border-slate-600/50 shadow-sm flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {emp.name.charAt(0)}
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">{emp.name}</h4>
              <span className="flex items-center text-[10px] font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 px-3 py-1 rounded-full mt-2">
                <Shield size={12} className="mr-1.5" />
                {emp.role}
              </span>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700/50 relative z-10">
              <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-700/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-600/30">
                <Mail size={16} className="mr-3 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-700/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-600/30">
                <Calendar size={16} className="mr-3 text-slate-400 dark:text-slate-500" />
                Joined {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/50 dark:to-violet-900/50 text-primary-600 dark:text-primary-400 rounded-2xl border border-primary-100 dark:border-primary-500/20 shadow-sm">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">New Employee</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Initial Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="pt-6 mt-2 border-t border-slate-100 dark:border-slate-700/50 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3.5 btn-primary"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
