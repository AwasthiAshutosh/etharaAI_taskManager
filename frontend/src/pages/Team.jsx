import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, FolderKanban, CheckSquare, ChevronDown, ChevronUp, Mail, Shield, User } from 'lucide-react';

const Team = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get('/projects');
        setProjects(res.data.projects);
      } catch (error) {
        toast.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleProject = async (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
      return;
    }
    setExpandedProject(projectId);

    // Fetch tasks for this project if not already loaded
    if (!projectTasks[projectId]) {
      try {
        const res = await api.get(`/tasks?projectId=${projectId}&limit=100`);
        setProjectTasks(prev => ({ ...prev, [projectId]: res.data.tasks }));
      } catch (e) {
        toast.error('Failed to load project tasks');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-emerald-500';
      case 'In Progress': return 'bg-amber-500';
      default: return 'bg-slate-400 dark:bg-[#52525b]';
    }
  };

  const getMemberTaskStats = (memberId, tasks) => {
    const memberTasks = tasks.filter(t => (t.assignedTo?._id || t.assignedTo) === memberId);
    const total = memberTasks.length;
    const done = memberTasks.filter(t => t.status === 'Done').length;
    const inProgress = memberTasks.filter(t => t.status === 'In Progress').length;
    const todo = memberTasks.filter(t => t.status === 'To Do').length;
    return { total, done, inProgress, todo };
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Team</h1>
        <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-0.5">
          See which teams are working on each project and their assigned members.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
            <FolderKanban size={18} />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500 dark:text-[#a1a1aa] uppercase tracking-wider">Active Projects</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none mt-1">{projects.length}</h3>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500 dark:text-[#a1a1aa] uppercase tracking-wider">Total Members</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none mt-1">
              {new Set(projects.flatMap(p => p.members?.map(m => m._id) || [])).size}
            </h3>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <CheckSquare size={18} />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500 dark:text-[#a1a1aa] uppercase tracking-wider">Avg. Team Size</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none mt-1">
              {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.members?.length || 0), 0) / projects.length) : 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Projects with Teams */}
      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-slate-400 dark:text-[#71717a]" />
          </div>
          <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">No projects yet</h3>
          <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-1">Create a project to start building your team.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const isExpanded = expandedProject === project._id;
            const tasks = projectTasks[project._id] || [];
            const tasksDone = tasks.filter(t => t.status === 'Done').length;
            const progress = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;

            return (
              <div key={project._id} className="card p-0 overflow-hidden">
                {/* Project Header - Clickable */}
                <button
                  onClick={() => toggleProject(project._id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-[#18181b]/50 transition-colors"
                >
                  {/* Project Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5e6ad2]/20 to-[#818cf8]/10 border border-[#5e6ad2]/20 flex items-center justify-center flex-shrink-0">
                    <FolderKanban size={20} className="text-[#5e6ad2]" />
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[12px] text-slate-500 dark:text-[#71717a] flex items-center gap-1">
                        <Users size={12} />
                        {project.members?.length || 0} members
                      </span>
                      {isExpanded && tasks.length > 0 && (
                        <span className="text-[12px] text-slate-500 dark:text-[#71717a] flex items-center gap-1">
                          <CheckSquare size={12} />
                          {tasks.length} tasks
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Member Avatars Stack */}
                  <div className="hidden sm:flex items-center -space-x-2 mr-2">
                    {(project.members || []).slice(0, 4).map((member, i) => (
                      <div
                        key={member._id}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#818cf8] flex items-center justify-center text-[10px] font-bold text-white uppercase border-2 border-white dark:border-[#0e0e11]"
                        title={member.name}
                        style={{ zIndex: 4 - i }}
                      >
                        {member.name?.charAt(0)}
                      </div>
                    ))}
                    {(project.members?.length || 0) > 4 && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#27272a] flex items-center justify-center text-[10px] font-semibold text-slate-500 dark:text-[#71717a] border-2 border-white dark:border-[#0e0e11]">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-slate-400 dark:text-[#71717a] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400 dark:text-[#71717a] flex-shrink-0" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-[#e5e7eb] dark:border-[#27272a] animate-fade-in">
                    {/* Project Description */}
                    {project.description && (
                      <div className="px-5 py-3 bg-slate-50/50 dark:bg-[#0a0a0d]/50 border-b border-[#e5e7eb] dark:border-[#27272a]">
                        <p className="text-[13px] text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {tasks.length > 0 && (
                      <div className="px-5 py-3 border-b border-[#e5e7eb] dark:border-[#27272a]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[12px] font-medium text-slate-500 dark:text-[#71717a]">Progress</span>
                          <span className="text-[12px] font-semibold text-slate-700 dark:text-[#a1a1aa]">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-[#27272a] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#5e6ad2] to-[#818cf8] rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Members List */}
                    <div className="p-5">
                      <h4 className="text-[12px] font-bold text-slate-400 dark:text-[#71717a] uppercase tracking-wider mb-3">
                        Team Members
                      </h4>
                      
                      {(!project.members || project.members.length === 0) ? (
                        <p className="text-[13px] text-slate-500 dark:text-[#71717a] italic">No members assigned to this project.</p>
                      ) : (
                        <div className="space-y-2">
                          {project.members.map((member) => {
                            const stats = getMemberTaskStats(member._id, tasks);
                            return (
                              <div
                                key={member._id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] group hover:border-[#5e6ad2]/30 dark:hover:border-[#5e6ad2]/20 transition-colors"
                              >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#818cf8] flex items-center justify-center text-[11px] font-bold text-white uppercase flex-shrink-0">
                                  {member.name?.charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                                      {member.name}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                      member.role === 'Admin' 
                                        ? 'bg-[#5e6ad2]/10 text-[#5e6ad2] dark:bg-[#5e6ad2]/20 dark:text-[#818cf8]' 
                                        : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                    }`}>
                                      {member.role}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 dark:text-[#71717a] flex items-center gap-1 mt-0.5">
                                    <Mail size={10} />
                                    {member.email}
                                  </span>
                                </div>

                                {/* Task Stats */}
                                {stats.total > 0 && (
                                  <div className="hidden sm:flex items-center gap-2">
                                    <div className="flex items-center gap-1" title="Done">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <span className="text-[11px] font-medium text-slate-500 dark:text-[#71717a]">{stats.done}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title="In Progress">
                                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                                      <span className="text-[11px] font-medium text-slate-500 dark:text-[#71717a]">{stats.inProgress}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title="To Do">
                                      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-[#52525b]" />
                                      <span className="text-[11px] font-medium text-slate-500 dark:text-[#71717a]">{stats.todo}</span>
                                    </div>
                                  </div>
                                )}

                                {stats.total === 0 && (
                                  <span className="text-[11px] text-slate-400 dark:text-[#71717a] italic">No tasks</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;
