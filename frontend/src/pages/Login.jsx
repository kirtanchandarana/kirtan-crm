import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@kirtancrm.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/50 dark:bg-primary-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/50 dark:bg-violet-900/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-violet-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-10 rounded-[2.2rem] shadow-2xl border border-white/50 dark:border-slate-700/50">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-violet-700 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-primary-200 dark:shadow-none rotate-3 transition-transform hover:rotate-0 duration-300">
              <Sparkles size={40} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kirtan <span className="text-primary-600 dark:text-primary-400">CRM</span></h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">Manage your growth with precision</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-semibold border border-red-100 animate-fade-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium dark:text-white"
                  placeholder="admin@kirtancrm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium dark:text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 rounded-2xl text-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <span>Access Dashboard</span>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700/50 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Enterprise Grade • Secure Auth • Fast Sync
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
