import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  CheckSquare, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  UserPlus,
  Mail,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, insightsRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/insights')
        ]);
        setStats(statsRes.data.data);
        setInsights(insightsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statCards = [
    { name: 'Total Customers', value: stats?.totalCustomers, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Total Leads', value: stats?.totalLeads, icon: Target, gradient: 'from-primary-600 to-violet-600' },
    { name: 'Pending Tasks', value: stats?.pendingTasks, icon: CheckSquare, gradient: 'from-amber-500 to-orange-500' },
    { name: 'Conversion Rate', value: '12%', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card-hover p-6 group">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg shadow-slate-200/50 dark:shadow-none group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                <ArrowUpRight size={14} className="mr-0.5" />
                2.5%
              </span>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stat.value}</p>
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1">{stat.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Insights Panel */}
      <div className="card p-6 bg-gradient-to-br from-indigo-900 to-violet-900 border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Sparkles className="mr-2 text-amber-400" size={24} />
          AI Smart Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors group">
            <p className="text-indigo-200 text-sm font-medium mb-1">Overdue Followups</p>
            <p className="text-3xl font-extrabold text-white">{insights?.overdueFollowups || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors group">
            <p className="text-indigo-200 text-sm font-medium mb-1">Best Lead Source</p>
            <p className="text-xl font-extrabold text-white capitalize truncate mt-2">{insights?.bestLeadSource || 'N/A'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors group">
            <p className="text-indigo-200 text-sm font-medium mb-1">Top Employee</p>
            <p className="text-xl font-extrabold text-white truncate mt-2">{insights?.topEmployee || 'N/A'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors group">
            <p className="text-indigo-200 text-sm font-medium mb-1">Inactive Leads</p>
            <p className="text-3xl font-extrabold text-white">{insights?.inactiveLeads || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Lead Distribution</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Breakdown by current lead status</p>
            </div>
            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl text-slate-400 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.leadDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                <Tooltip 
                  cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                  contentStyle={{borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                  itemStyle={{color: '#0f172a', fontWeight: 600}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {stats?.leadDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Activity</h3>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock size={16} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">New lead added</p>
                    <span className="text-[10px] font-bold uppercase text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-full">2h</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">John Doe was added by Admin to the system.</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3.5 text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-xl transition-all duration-300">
            View All Activity
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        {showQuickActions && (
          <div className="flex flex-col items-end space-y-3 mb-4 animate-in slide-in-from-bottom-4 fade-in duration-200">
            <button 
              onClick={() => navigate('/customers')}
              className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform group"
            >
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Add Customer</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 transition-colors">
                <UserPlus size={16} />
              </div>
            </button>
            <button 
              onClick={() => navigate('/leads')}
              className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform group"
            >
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Add Lead</span>
              <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 transition-colors">
                <Target size={16} />
              </div>
            </button>
            <button 
              onClick={() => navigate('/tasks')}
              className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform group"
            >
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Add Task</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 transition-colors">
                <CheckSquare size={16} />
              </div>
            </button>
            <button 
              onClick={() => window.location.href = 'mailto:'}
              className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform group"
            >
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Send Email</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 transition-colors">
                <Mail size={16} />
              </div>
            </button>
          </div>
        )}
        <button 
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/40 transition-all duration-300 ${showQuickActions ? 'bg-slate-800 dark:bg-slate-700 rotate-45 text-white' : 'bg-gradient-to-br from-primary-600 to-violet-600 text-white hover:scale-110 hover:shadow-primary-500/60'}`}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
