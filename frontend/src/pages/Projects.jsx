import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, MoreVertical, Trash2, Edit2, FolderKanban, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [availableUsers, setAvailableUsers] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);

      if (user?.role === 'Admin') {
        const usersRes = await api.get('/users');
        setAvailableUsers(usersRes.data.users);
      }
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await api.post('/projects', data);
      toast.success('Project created successfully');
      setProjects([res.data.project, ...projects]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-0.5">Manage your team's active workspaces.</p>
        </div>
        
        {user?.role === 'Admin' && (
          <button 
            className="btn btn-primary text-[13px] px-3"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="loading-pulse w-8 h-8 rounded-full bg-[#5e6ad2]/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#5e6ad2]"></div>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-20 animate-fade-in">
          <div className="w-12 h-12 bg-slate-100 dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="text-slate-400 dark:text-[#71717a]" size={20} />
          </div>
          <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">No projects found</h3>
          <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-1">You haven't been assigned to any projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, idx) => (
            <Link 
              to={`/projects/${project._id}`}
              key={project._id} 
              className="card group hover:border-[#d1d5db] dark:hover:border-[#3f3f46] animate-slide-in flex flex-col"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded border border-[#e5e7eb] dark:border-[#27272a] bg-slate-50 dark:bg-[#0e0e11] flex items-center justify-center text-slate-600 dark:text-[#a1a1aa] group-hover:text-[#5e6ad2] transition-colors">
                    <FolderKanban size={14} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white group-hover:text-[#5e6ad2] transition-colors">
                    {project.title}
                  </h3>
                </div>
                
                {user?.role === 'Admin' && (
                  <button 
                    onClick={(e) => handleDelete(project._id, e)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10 relative"
                    title="Delete Project"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <p className="text-[13px] text-slate-600 dark:text-[#a1a1aa] mb-5 line-clamp-2 min-h-[38px] flex-1">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t border-[#e5e7eb] dark:border-[#27272a]">
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-[#71717a]">
                  <Users size={12} />
                  <span>{project.members?.length || 0} members</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <Calendar size={12} />
                  <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="card w-full max-w-md relative z-10 p-6 animate-slide-in shadow-2xl dark:border-[#27272a] bg-white dark:bg-[#0e0e11]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Project Title</label>
                <input 
                  {...register('title', { required: 'Title is required' })}
                  className="input" 
                  placeholder="e.g., E-Commerce Platform"
                  autoFocus
                />
                {errors.title && <p className="text-red-500 text-[12px] mt-1">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-1.5">Description (Optional)</label>
                <textarea 
                  {...register('description')}
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
                        {...register('members')} 
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
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
