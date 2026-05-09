import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Target, 
  Users, 
  CheckSquare, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SmartHub = () => {
  const [activeTab, setActiveTab] = useState('priority'); // priority or export
  const [priorities, setPriorities] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = async () => {
    try {
      const res = await axios.get('/api/ai/priorities');
      setPriorities(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (type) => {
    try {
      let data = [];
      let filename = '';
      let headers = [];

      if (type === 'customers') {
        const res = await axios.get('/api/customers');
        data = res.data.data;
        filename = 'customers_export.csv';
        headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Address', 'Added On'];
      } else if (type === 'reports') {
        const res = await axios.get('/api/dashboard/stats');
        const stats = res.data.data;
        data = [
          { metric: 'Total Customers', value: stats.totalCustomers },
          { metric: 'Total Leads', value: stats.totalLeads },
          { metric: 'Pending Tasks', value: stats.pendingTasks }
        ];
        filename = 'crm_report.csv';
        headers = ['Metric', 'Value'];
      }

      if (data.length === 0) return alert('No data available to export');

      // Convert to CSV
      const csvContent = [
        headers.join(','),
        ...data.map(item => {
          if (type === 'customers') return `${item.id},"${item.name}","${item.email}","${item.phone}","${item.company}","${item.address}",${item.created_at}`;
          if (type === 'reports') return `"${item.metric}","${item.value}"`;
          return '';
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Error exporting data');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await axios.get('/api/leads');
      const leads = res.data.data;
      
      // Open a print window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Leads Export - PDF</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
              h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
              th { background-color: #f8fafc; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Kirtan CRM - Leads Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Added On</th>
                </tr>
              </thead>
              <tbody>
                ${leads.map(l => `
                  <tr>
                    <td>${l.name}</td>
                    <td>${l.email || 'N/A'}</td>
                    <td>${l.status}</td>
                    <td>${l.source || 'Direct'}</td>
                    <td>${new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      alert('Error exporting leads PDF');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-500" size={32} />
            Smart Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">AI-driven priorities and advanced data export center.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-sm">
          <button 
            onClick={() => setActiveTab('priority')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'priority' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            AI Priority Engine
          </button>
          <button 
            onClick={() => setActiveTab('export')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'export' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Export Center
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : activeTab === 'priority' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Lead Priority */}
          <div className="card p-8 border-t-4 border-t-orange-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Contact First</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Based on high conversion probability and recency.</p>
            {priorities?.contact_first_lead ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{priorities.contact_first_lead.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{priorities.contact_first_lead.email}</p>
                <span className="inline-block mt-3 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded-md">
                  {priorities.contact_first_lead.status} Lead
                </span>
                <button onClick={() => navigate('/leads')} className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors">
                  Take Action <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400">No leads require immediate attention.</p>
            )}
          </div>

          {/* Customer Priority */}
          <div className="card p-8 border-t-4 border-t-blue-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Inactive Customer</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Customer with the longest period of inactivity.</p>
            {priorities?.inactive_customer ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{priorities.inactive_customer.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Added: {new Date(priorities.inactive_customer.created_at).toLocaleDateString()}</p>
                <span className="inline-block mt-3 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-md">
                  Re-engagement Needed
                </span>
                <button onClick={() => navigate(`/customers/${priorities.inactive_customer.id}/timeline`)} className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                  View Timeline <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400">All customers are actively engaged.</p>
            )}
          </div>

          {/* Task Priority */}
          <div className="card p-8 border-t-4 border-t-emerald-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <CheckSquare size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Urgent Task</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Highest priority pending task requiring action.</p>
            {priorities?.urgent_task ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{priorities.urgent_task.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-500" /> Due: {new Date(priorities.urgent_task.due_date).toLocaleDateString()}
                </p>
                <span className="inline-block mt-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-md">
                  Action Required
                </span>
                <button onClick={() => navigate('/tasks')} className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                  Go to Tasks <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400">No urgent tasks pending.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Customers Export</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Download a complete CSV of your customer database including contact info.</p>
            <button 
              onClick={() => handleExportCSV('customers')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-lg shadow-slate-200 dark:shadow-indigo-500/20 transition-all"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>

          <div className="card p-8 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Leads Report</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Generate a print-ready PDF format of your current active leads.</p>
            <button 
              onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-lg shadow-slate-200 dark:shadow-indigo-500/20 transition-all"
            >
              <Download size={18} /> Export PDF
            </button>
          </div>

          <div className="card p-8 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Analytics Report</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Export key dashboard statistics and performance metrics to CSV.</p>
            <button 
              onClick={() => handleExportCSV('reports')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-lg shadow-slate-200 dark:shadow-indigo-500/20 transition-all"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartHub;
