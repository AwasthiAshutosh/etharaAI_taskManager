import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, CheckSquare, Plus, X, Loader2, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regEdit, handleSubmit: handEdit, reset: resetEdit, setValue } = useForm();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?projectId=${id}&limit=100`)
        ]);
        setProject(projRes.data.project);
        setTasks(tasksRes.data.tasks);

        if (user?.role === 'Admin') {
          const usersRes = await api.get('/users');
          setAvailableUsers(usersRes.data.users);
        }
      } catch (error) {
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, user]);

  const onSubmitTask = async (data) => {
    try {
      setSubmitting(true);
      // Hardcode projectId to current project
      const payload = { ...data, projectId: id };
      const res = await api.post('/tasks', payload);
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

  const openEditModal = () => {
    setValue('title', project.title);
    setValue('description', project.description);
    setValue('members', project.members?.map(m => m._id) || []);
    setIsEditModalOpen(true);
  };

  const onSubmitEdit = async (data) => {
    try {
      setSubmitting(true);
      const res = await api.put(`/projects/${id}`, data);
      toast.success('Project updated successfully');
      setProject(res.data.project);
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated');
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="loading-pulse w-8 h-8 rounded-full bg-[#5e6ad2]/20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#5e6ad2]"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Project not found</h2>
        <Link to="/projects" className="text-[#5e6ad2] hover:underline text-sm mt-2 block">Back to projects</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#18181b] text-slate-500 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{project.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-[13px] text-slate-500 dark:text-[#a1a1aa]">
              <span className="flex items-center gap-1.5"><Users size={14} /> {project.members?.length || 0} Members</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={openEditModal}
            className="btn btn-secondary text-[13px] px-3 gap-2"
          >
            <Edit2 size={14} />
            <span className="hidden sm:inline">Edit Project</span>
          </button>
        )}
      </div>

      <div className="card">
        <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
        <p className="text-[14px] text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
          {project.description || 'No description provided for this project.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Project Tasks</h2>
          {user?.role === 'Admin' && (
            <button 
              className="btn btn-primary text-[13px] px-3"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              New Task
            </button>
          )}
        </div>
        
        {tasks.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="w-5 h-5 text-slate-400 dark:text-[#71717a]" />
            </div>
            <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">No tasks found</h3>
            <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-1">There are no tasks assigned to this project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task, idx) => (
              <div 
                key={task._id} 
                className="card flex flex-col group"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-[#71717a] uppercase tracking-wider">
                    {project.title}
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
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>

                    {user?.role === 'Admin' && (
                      <button 
                        onClick={() => handleDeleteTask(task._id)}
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
      </div>

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
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Assign To</label>
                  <select {...register('assignedTo')} className="select">
                    <option value="">Unassigned</option>
                    {project.members?.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Priority</label>
                  <select {...register('priority')} className="select">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Due Date</label>
                <input 
                  type="date"
                  {...register('dueDate')}
                  className="input w-full" 
                />
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

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="card w-full max-w-md relative z-10 p-6 animate-slide-in shadow-2xl dark:border-[#27272a] bg-white dark:bg-[#0e0e11]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Edit Project</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handEdit(onSubmitEdit)} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Project Title</label>
                <input 
                  {...regEdit('title', { required: 'Title is required' })}
                  className="input" 
                  placeholder="e.g., E-Commerce Platform"
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Description (Optional)</label>
                <textarea 
                  {...regEdit('description')}
                  className="input min-h-[80px] resize-y" 
                  placeholder="Briefly describe the project's goal..."
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Assign Members</label>
                <div className="max-h-32 overflow-y-auto border border-[#e5e7eb] dark:border-[#27272a] rounded-md p-2 space-y-1">
                  {availableUsers.map(u => (
                    <label key={u._id} className="flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-[#18181b] rounded">
                      <input 
                        type="checkbox" 
                        value={u._id} 
                        {...regEdit('members')} 
                        className="rounded border-slate-300 dark:border-[#3f3f46] text-[#5e6ad2] focus:ring-[#5e6ad2] bg-white dark:bg-[#18181b]"
                      />
                      {u.name} <span className="text-[11px] text-slate-400">({u.role})</span>
                    </label>
                  ))}
                  {availableUsers.length === 0 && <span className="text-[12px] text-slate-500">No users available.</span>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb] dark:border-[#27272a]">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-ghost text-[13px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary text-[13px] px-4"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
