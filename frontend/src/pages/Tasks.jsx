import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Filter, Calendar, Plus, CheckSquare, X, Loader2, Trash2 } from 'lucide-react';

const Tasks = ({ view = 'my-issues' }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const selectedProjectId = watch('projectId');

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = user._id || user.id;
      const url = view === 'my-issues' ? `/tasks?assignedTo=${userId}` : '/tasks';
      const res = await api.get(url);
      setTasks(res.data.tasks);
      
      // If admin, preload projects for the create modal
      if (user?.role === 'Admin') {
        const projRes = await api.get('/projects');
        setAvailableProjects(projRes.data.projects);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const currentProjectMembers = availableProjects.find(p => p._id === selectedProjectId)?.members || [];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [view, user]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated');
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const onSubmitTask = async (data) => {
    try {
      setSubmitting(true);
      const res = await api.post('/tasks', data);
      toast.success('Task created successfully');
      setTasks([res.data.task, ...tasks]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High': return <span className="badge badge-high">High</span>;
      case 'Medium': return <span className="badge badge-medium">Medium</span>;
      case 'Low': return <span className="badge badge-low">Low</span>;
      default: return null;
    }
  };

  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {view === 'all-issues' ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-0.5">
            {view === 'all-issues' ? 'Overview of all tracked tasks.' : 'Manage and track your assigned work.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              className="select w-36" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ paddingLeft: '32px' }}
            >
              <option value="All">All tasks</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#a1a1aa] pointer-events-none" />
          </div>

          {user?.role === 'Admin' && view === 'all-issues' && (
            <button 
              className="btn btn-primary text-[13px] px-3"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="loading-pulse w-8 h-8 rounded-full bg-[#5e6ad2]/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#5e6ad2]"></div>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg flex items-center justify-center mb-4">
            <CheckSquare className="w-5 h-5 text-slate-400 dark:text-[#71717a]" />
          </div>
          <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">No tasks found</h3>
          <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task, idx) => (
            <div 
              key={task._id} 
              className="card flex flex-col animate-slide-in group cursor-pointer"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-[#71717a] uppercase tracking-wider">
                  {task.projectId?.title || 'Unknown Project'}
                </span>
                {getPriorityBadge(task.priority)}
              </div>
              
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#5e6ad2] transition-colors">
                {task.title}
              </h3>
              
              <p className="text-[13px] text-slate-600 dark:text-[#a1a1aa] line-clamp-2 flex-1 mb-4">
                {task.description || 'No description provided.'}
              </p>
              
              <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#27272a] mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5" title={task.assignedTo?.name || 'Unassigned'}>
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#27272a] flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-[#a1a1aa] border border-white dark:border-[#18181b]">
                      {task.assignedTo?.name?.charAt(0) || '?'}
                    </div>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-[#71717a] min-w-0">
                      <Calendar size={12} className={`shrink-0 ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500' : ''}`} />
                      <span className={`truncate ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500 font-medium' : ''}`}>
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <select 
                    className="select text-[12px] w-[100px] bg-transparent border-transparent hover:bg-slate-100 hover:border-[#e5e7eb] dark:hover:bg-[#27272a] dark:hover:border-[#3f3f46]"
                    style={{ padding: '4px 24px 4px 8px' }}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={user.role === 'Member' && (task.assignedTo?._id || task.assignedTo) !== user._id}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>

                  {user?.role === 'Admin' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task._id);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                      title="Delete Task"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="card w-full max-w-lg relative z-10 p-6 animate-slide-in shadow-2xl dark:border-[#27272a] bg-white dark:bg-[#0e0e11] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitTask)} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Task Title</label>
                <input 
                  {...register('title', { required: 'Title is required' })}
                  className="input" 
                  placeholder="e.g., Fix authentication bug"
                  autoFocus
                />
                {errors.title && <p className="text-red-500 text-[12px] mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Project</label>
                  <select {...register('projectId', { required: 'Project is required' })} className="select">
                    <option value="">Select Project...</option>
                    {availableProjects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                  {errors.projectId && <p className="text-red-500 text-[12px] mt-1">{errors.projectId.message}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Assign To</label>
                  <select {...register('assignedTo')} className="select" disabled={!selectedProjectId}>
                    <option value="">{selectedProjectId ? 'Unassigned' : 'Select project first...'}</option>
                    {currentProjectMembers.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Priority</label>
                  <select {...register('priority')} className="select">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Due Date</label>
                  <input 
                    type="date"
                    {...register('dueDate')}
                    className="input" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Description (Optional)</label>
                <textarea 
                  {...register('description')}
                  className="input min-h-[80px] resize-y" 
                  placeholder="Provide context and details about this task..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb] dark:border-[#27272a]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost text-[13px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary text-[13px] px-4"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
