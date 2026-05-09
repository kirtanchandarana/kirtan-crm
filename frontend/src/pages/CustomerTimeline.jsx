import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Target, 
  CheckSquare, 
  Activity,
  Mail,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

const CustomerTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Email Generator State
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [emailType, setEmailType] = useState('welcome');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTimeline();
    fetchCustomer();
  }, [id]);

  const fetchTimeline = async () => {
    try {
      const res = await axios.get(`/api/customers/${id}/timeline`);
      setTimeline(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomer = async () => {
    try {
      // Small hack: finding the customer by getting all and filtering. 
      // Ideally we'd have a GET /api/customers/:id
      const res = await axios.get('/api/customers');
      const cust = res.data.data.find(c => c.id === parseInt(id));
      setCustomer(cust);
    } catch (err) {
      console.error(err);
    }
  };

  const generateEmail = () => {
    const name = customer?.name || 'Customer';
    const company = customer?.company || 'your company';
    
    const templates = {
      welcome: `Subject: Welcome to Kirtan CRM!

Hi ${name},

We are thrilled to welcome you and the team at ${company} to our platform. Our goal is to ensure you get the absolute most out of our services. 

If you have any questions or need immediate assistance, simply reply to this email.

Best regards,
Your Account Manager`,
      followup: `Subject: Checking in - ${company}

Hi ${name},

I'm following up on our last conversation. I'd love to know if you've had a chance to review the materials I sent over.

Let me know if you have any questions or if you'd like to jump on a quick call this week to discuss further.

Best regards,
Your Account Manager`,
      payment: `Subject: Action Required: Payment Reminder

Hi ${name},

This is a friendly reminder that there is an outstanding invoice for ${company}'s recent billing cycle. 

Please process the payment at your earliest convenience to avoid any service interruptions. If payment has already been made, please disregard this message.

Thank you,
Billing Team`,
      meeting: `Subject: Request for Meeting - Next Steps

Hi ${name},

I hope you're having a great week. 

I'd like to schedule a brief 15-minute sync with you to discuss our next steps and ensure everything is aligning with your goals for ${company}.

Please let me know a few times that work best for you next week.

Best regards,
Your Account Manager`
    };

    setGeneratedEmail(templates[emailType]);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Users': return <Users size={20} className="text-blue-500" />;
      case 'MessageCircle': return <MessageCircle size={20} className="text-indigo-500" />;
      case 'Target': return <Target size={20} className="text-orange-500" />;
      case 'CheckSquare': return <CheckSquare size={20} className="text-emerald-500" />;
      case 'Activity': return <Activity size={20} className="text-slate-500" />;
      default: return <Activity size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {customer ? customer.name : 'Customer Timeline'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {customer?.company ? `Company: ${customer.company}` : 'Detailed interaction history'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            setShowEmailGenerator(true);
            generateEmail();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
        >
          <Sparkles size={18} />
          AI Email Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : timeline.length === 0 ? (
        <div className="card p-12 text-center border-dashed bg-slate-50/50 dark:bg-slate-800/50">
          <p className="font-semibold text-slate-500 dark:text-slate-400">No timeline events found.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-700/50 ml-6 space-y-8 pb-8">
          {timeline.map((event, idx) => (
            <div key={`${event.id}-${idx}`} className="relative pl-8 group">
              <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                {getIcon(event.icon)}
              </div>
              <div className="card p-5 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{event.title}</h4>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                    {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Email Generator Modal */}
      {showEmailGenerator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Smart Email Generator</h3>
              </div>
              <button 
                onClick={() => setShowEmailGenerator(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="rotate-180" />
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2">
              {[
                { id: 'welcome', label: 'Welcome Email' },
                { id: 'followup', label: 'Follow-up' },
                { id: 'payment', label: 'Payment Reminder' },
                { id: 'meeting', label: 'Meeting Request' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setEmailType(type.id);
                    // Defer execution slightly to let state update
                    setTimeout(generateEmail, 0); 
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                    emailType === type.id 
                      ? 'bg-slate-800 text-white dark:bg-indigo-500 dark:text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                className="w-full h-64 p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none custom-scrollbar"
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
              />
              <button 
                onClick={copyToClipboard}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => window.location.href = `mailto:${customer?.email || ''}?subject=${encodeURIComponent(generatedEmail.split('\n')[0].replace('Subject: ', ''))}&body=${encodeURIComponent(generatedEmail.split('\n').slice(2).join('\n'))}`}
                className="flex-1 btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Open in Email Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTimeline;
