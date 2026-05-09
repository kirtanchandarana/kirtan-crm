import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Building2,
  MapPin,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name or company..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-primary px-6 py-3 flex items-center justify-center gap-2">
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 border-dashed">
            <p className="text-slate-500 dark:text-slate-400 font-medium">No customers found.</p>
          </div>
        ) : filteredCustomers.map((customer) => (
          <div key={customer.id} className="card-hover p-6 relative group overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="absolute top-4 right-4 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
              <button className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors">
                <Edit size={16} />
              </button>
              <button className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                {customer.name.charAt(0)}
              </div>
              <div className="ml-4 flex-1 pr-12">
                <h4 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight truncate">{customer.name}</h4>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  <Building2 size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" /> 
                  <span className="truncate">{customer.company || 'Private Client'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 relative z-10">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 group/item">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 mr-3 group-hover/item:bg-primary-50 dark:group-hover/item:bg-primary-500/10 group-hover/item:text-primary-500 dark:group-hover/item:text-primary-400 transition-colors">
                  <Mail size={14} />
                </div>
                <span className="truncate font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 group/item">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 mr-3 group-hover/item:bg-primary-50 dark:group-hover/item:bg-primary-500/10 group-hover/item:text-primary-500 dark:group-hover/item:text-primary-400 transition-colors">
                  <Phone size={14} />
                </div>
                <span className="font-medium">{customer.phone}</span>
              </div>
              <div className="flex items-start text-sm text-slate-600 dark:text-slate-300 group/item">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 mr-3 mt-0.5 group-hover/item:bg-primary-50 dark:group-hover/item:bg-primary-500/10 group-hover/item:text-primary-500 dark:group-hover/item:text-primary-400 transition-colors">
                  <MapPin size={14} />
                </div>
                <span className="flex-1 font-medium leading-snug">{customer.address || 'No address provided'}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 relative z-10">
              <button 
                onClick={() => navigate(`/customers/${customer.id}/timeline`)}
                className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10 hover:bg-primary-50 dark:hover:bg-primary-500/20 rounded-xl transition-colors group/btn"
              >
                <span>View Timeline & Emails</span>
                <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
