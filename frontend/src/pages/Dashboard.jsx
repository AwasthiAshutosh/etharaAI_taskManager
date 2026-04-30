import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme detection for charts (reactive)
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tasks/stats/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="loading-pulse w-8 h-8 rounded-full bg-[#5e6ad2]/20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#5e6ad2]"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Projects', value: stats?.totalProjects || 0, icon: <FolderKanban size={18} />, color: 'text-[#5e6ad2]', bg: 'bg-[#5e6ad2]/10 border border-[#5e6ad2]/20' },
    { title: 'Total Tasks', value: stats?.totalTasks || 0, icon: <CheckSquare size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
    { title: 'My Open Tasks', value: stats?.myTasks || 0, icon: <Clock size={18} />, color: 'text-amber-500', bg: 'bg-amber-500/10 border border-amber-500/20' },
    { title: 'Overdue Tasks', value: stats?.overdueTasks || 0, icon: <AlertCircle size={18} />, color: 'text-rose-500', bg: 'bg-rose-500/10 border border-rose-500/20' },
  ];

  const statusData = [
    { name: 'To Do', value: stats?.tasksByStatus['To Do'] || 0, color: isDark ? '#a1a1aa' : '#9ca3af' },
    { name: 'In Progress', value: stats?.tasksByStatus['In Progress'] || 0, color: '#f59e0b' },
    { name: 'Done', value: stats?.tasksByStatus['Done'] || 0, color: '#10b981' },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'Low', value: stats?.tasksByPriority['Low'] || 0 },
    { name: 'Medium', value: stats?.tasksByPriority['Medium'] || 0 },
    { name: 'High', value: stats?.tasksByPriority['High'] || 0 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0e0e11] border border-[#e5e7eb] dark:border-[#27272a] shadow-lg rounded-md p-2.5 text-[13px]">
          <p className="text-slate-500 dark:text-[#a1a1aa] mb-1 font-medium">{payload[0].payload.name}</p>
          <p className="text-slate-900 dark:text-white font-bold">{payload[0].value} tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-0.5">High-level metrics across all your workspaces.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="card flex items-center p-4 gap-4 animate-slide-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg} ${card.color} transition-transform group-hover:scale-105`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-500 dark:text-[#a1a1aa] uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Status Chart */}
        <div className="card h-80 flex flex-col animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-6">Tasks by Status</h3>
          <div className="flex-1 w-full min-h-0">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: isDark ? '#a1a1aa' : '#64748b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-slate-500">No task data available</div>
            )}
          </div>
        </div>

        {/* Priority Chart */}
        <div className="card h-80 flex flex-col animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white mb-6">Tasks by Priority</h3>
          <div className="flex-1 w-full min-h-0 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#27272a' : '#f3f4f6'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : '#64748b' }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="value" 
                  fill="#5e6ad2" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
