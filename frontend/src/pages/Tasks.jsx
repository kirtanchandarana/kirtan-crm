import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle,
  User,
  AlertCircle
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await axios.patch(`/api/tasks/${id}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Error updating task');
    }
  };

  const isOverdue = (date) => {
    return new Date(date) < new Date() && date;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Task Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Track and manage your daily activities</p>
        </div>
        <button className="btn-primary px-6 py-3 flex items-center justify-center gap-2">
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-12 text-center border-dashed bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-500 dark:text-slate-400">All caught up! No pending tasks.</p>
          </div>
        ) : tasks.map((task) => (
          <div 
            key={task.id} 
            className={`card p-5 flex items-start gap-5 group ${
              task.status === 'Completed' ? 'opacity-60 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/30 hover:opacity-100' : 'hover:-translate-y-1 hover:shadow-md hover:border-primary-200/60 dark:hover:border-primary-500/30'
            }`}
          >
            <button 
              onClick={() => toggleStatus(task.id, task.status)}
              className={`mt-1 flex-shrink-0 transition-colors ${
                task.status === 'Completed' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600 hover:text-primary-500 dark:hover:text-primary-400'
              }`}
            >
              {task.status === 'Completed' ? <CheckCircle2 size={26} /> : <Circle size={26} />}
            </button>
            
            <div className="flex-1">
              <h4 className={`font-bold text-lg ${task.status === 'Completed' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>
                {task.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{task.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className={`flex items-center text-xs font-bold px-2.5 py-1.5 rounded-full border ${
                  isOverdue(task.due_date) && task.status === 'Pending' 
                    ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/50'
                }`}>
                  <Calendar size={14} className="mr-1.5" />
                  Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  {isOverdue(task.due_date) && task.status === 'Pending' && (
                    <AlertCircle size={14} className="ml-1.5" />
                  )}
                </div>
                
                <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 px-2.5 py-1.5 rounded-full">
                  <User size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />
                  {task.assigned_to_name}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-start self-stretch">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
