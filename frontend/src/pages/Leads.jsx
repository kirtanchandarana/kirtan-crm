import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit,
  Mail,
  User,
  Filter,
  X,
  Zap
} from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/leads');
      setLeads(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/leads', formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', source: '' });
      fetchLeads();
    } catch (err) {
      alert('Error adding lead');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this lead?')) {
      try {
        await axios.delete(`/api/leads/${id}`);
        fetchLeads();
      } catch (err) {
        alert('Error deleting lead');
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/leads/${id}/status`, { status });
      fetchLeads();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'Lost': return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'Qualified': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'Contacted': return 'bg-amber-100 text-amber-700 ring-amber-600/20';
      default: return 'bg-slate-100 text-slate-700 ring-slate-600/20';
    }
  };

  const getLeadScore = (lead) => {
    let score = 0;
    
    if (lead.status === 'Qualified') score += 40;
    else if (lead.status === 'Contacted') score += 20;
    else if (lead.status === 'New') score += 10;
    else if (lead.status === 'Lost') score -= 50;

    if (lead.followups_count > 0) {
        score += lead.followups_count * 10;
    }

    if (lead.last_contact_date) {
        const daysSinceContact = Math.floor((new Date() - new Date(lead.last_contact_date)) / (1000 * 60 * 60 * 24));
        if (daysSinceContact <= 2) score += 30;
        else if (daysSinceContact <= 7) score += 15;
        else if (daysSinceContact > 30) score -= 20;
    } else {
        const daysSinceCreation = Math.floor((new Date() - new Date(lead.created_at)) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation <= 2) score += 20;
        else if (daysSinceCreation > 14) score -= 10;
    }

    if (lead.status === 'Won') return null; // Don't show score for won leads
    
    if (score >= 60) return { label: 'Hot', icon: <Zap size={12} className="mr-1 fill-orange-500" />, classes: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' };
    if (score >= 30) return { label: 'Warm', icon: <Zap size={12} className="mr-1 fill-amber-500" />, classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' };
    return { label: 'Cold', icon: <Zap size={12} className="mr-1 fill-slate-400" />, classes: 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20' };
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm dark:text-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">
            <Filter size={18} className="mr-2 text-slate-400 dark:text-slate-500" />
            Filter
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-6 py-3 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-700/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-500 font-medium">No leads found.</td>
                </tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/50 dark:to-violet-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold mr-4 border border-primary-200/30 dark:border-primary-700/30 shadow-sm group-hover:scale-110 transition-transform">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{lead.name}</p>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          <Mail size={12} className="mr-1.5 text-slate-400 dark:text-slate-500" /> {lead.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{lead.source || 'Direct'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`appearance-none text-xs font-bold px-3 py-1.5 pr-8 rounded-full border-none ring-1 ring-inset cursor-pointer outline-none focus:ring-2 focus:ring-primary-500 transition-all ${getStatusColor(lead.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const scoreData = getLeadScore(lead);
                      if (!scoreData) return <span className="text-sm text-slate-400">-</span>;
                      return (
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${scoreData.classes}`}>
                          {scoreData.icon}
                          {scoreData.label}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-2 border border-slate-200 dark:border-slate-600">
                        <User size={12} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      {lead.assigned_to_name || 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Add New Lead</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                  <input
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Source</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                  placeholder="Website, LinkedIn, etc."
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                />
              </div>
              
              <div className="pt-6 mt-2 border-t border-slate-100 dark:border-slate-700/50 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3.5 btn-primary"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
