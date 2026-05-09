import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CheckSquare, 
  UserPlus, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bell,
  Activity,
  Search,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Smart Hub', path: '/smarthub', icon: Sparkles },
    { name: 'Leads', path: '/leads', icon: Target },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'Employees', path: '/employees', icon: UserPlus });
    menuItems.push({ name: 'Activity Logs', path: '/activity-logs', icon: Activity });
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const res = await axios.get('/api/dashboard/notifications');
          setNotifications(res.data.data || []);
        } catch (err) {}
      }
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const res = await axios.get(`/api/search?q=${query}`);
        setSearchResults(res.data.results || []);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const getResultIcon = (type) => {
    switch(type) {
      case 'customer': return <Users size={16} />;
      case 'lead': return <Target size={16} />;
      case 'task': return <CheckSquare size={16} />;
      case 'employee': return <UserPlus size={16} />;
      default: return <Search size={16} />;
    }
  };

  const getResultPath = (type) => {
    switch(type) {
      case 'customer': return '/customers';
      case 'lead': return '/leads';
      case 'task': return '/tasks';
      case 'employee': return '/employees';
      default: return '/dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/50 dark:bg-slate-900 overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-white dark:bg-slate-800/80 border-r border-slate-200/60 dark:border-slate-700/50 transition-all duration-300 flex flex-col z-20 relative`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700/50">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
              K
            </div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Kirtan <span className="text-primary-600 dark:text-primary-400">CRM</span></h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${!isSidebarOpen && 'mx-auto'}`}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50/80 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <item.icon size={20} className={`min-w-[20px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isSidebarOpen && <span className={`ml-3.5 text-sm font-semibold ${isActive ? 'text-primary-700 dark:text-primary-300' : ''}`}>{item.name}</span>}
                {isSidebarOpen && isActive && (
                  <ChevronRight size={16} className="ml-auto opacity-50" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700/50">
          <div className={`flex items-center ${!isSidebarOpen ? 'justify-center' : 'p-3 mb-3 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-600/50 shadow-sm rounded-2xl'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900 dark:to-violet-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold shadow-sm border border-primary-200/30 dark:border-primary-700/30">
              {user?.name?.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors group ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="ml-3.5 text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search anywhere..." 
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => { if (searchQuery.length > 1) setShowDropdown(true); }}
                className="pl-11 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 border border-transparent dark:border-slate-700/50 rounded-full text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-primary-300 dark:focus:border-primary-600 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 outline-none transition-all w-64 focus:w-80 font-medium dark:text-white"
              />
              {showDropdown && (
                <div className="absolute top-full left-0 mt-3 w-full max-h-[400px] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50 py-2 custom-scrollbar z-50 animate-in fade-in zoom-in-95 duration-200">
                  {isSearching ? (
                    <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      Searching globally...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result, idx) => (
                      <Link 
                        key={`${result.type}-${result.id}-${idx}`}
                        to={getResultPath(result.type)}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 mr-3.5 transition-colors">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{result.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{result.email}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-md ml-3">
                          {result.type}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
                      No matching records found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={toggleDarkMode}
              className="relative p-2.5 text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 max-h-[400px] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/50 py-2 custom-scrollbar z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10">
                    <h4 className="font-bold text-slate-800 dark:text-white">Notifications & Reminders</h4>
                    <span className="bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold px-2.5 py-0.5 rounded-full">{notifications.length} New</span>
                  </div>
                  {notifications.length > 0 ? (
                    <div className="py-1">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="px-4 py-3 border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{notif.message}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{new Date(notif.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-10 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
                        <Bell size={24} className="text-slate-300 dark:text-slate-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">You're all caught up!</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new reminders at this time.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
