import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, projRes] = await Promise.all([
          api.get('/tasks?limit=500'),
          api.get('/projects'),
        ]);
        setTasks(tasksRes.data.tasks);
        setProjects(projRes.data.projects);
      } catch (error) {
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calendar helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  // Get events for a specific day
  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const events = [];

    // Tasks created on this day
    tasks.forEach(task => {
      const created = new Date(task.createdAt);
      if (created.getFullYear() === year && created.getMonth() === month && created.getDate() === day) {
        events.push({
          type: 'created',
          label: task.title,
          project: task.projectId?.title || 'Unknown',
          status: task.status,
          priority: task.priority,
        });
      }
    });

    // Tasks due on this day
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const due = new Date(task.dueDate);
      if (due.getFullYear() === year && due.getMonth() === month && due.getDate() === day) {
        events.push({
          type: 'due',
          label: task.title,
          project: task.projectId?.title || 'Unknown',
          status: task.status,
          priority: task.priority,
        });
      }
    });

    // Projects created on this day
    projects.forEach(proj => {
      const created = new Date(proj.createdAt);
      if (created.getFullYear() === year && created.getMonth() === month && created.getDate() === day) {
        events.push({
          type: 'project-created',
          label: proj.title,
          project: null,
          status: null,
          priority: null,
        });
      }
    });

    return events;
  };

  const today = new Date();
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Done': return 'bg-emerald-500';
      case 'In Progress': return 'bg-amber-500';
      default: return 'bg-slate-400';
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

  // Build calendar grid
  const calendarDays = [];
  // Empty cells for days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Calendar</h1>
          <p className="text-[13px] text-slate-500 dark:text-[#a1a1aa] mt-0.5">Track when tasks were created and when they are due.</p>
        </div>
        <button onClick={goToToday} className="btn btn-secondary text-[13px] px-3">
          Today
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#18181b] text-slate-500 dark:text-[#71717a] transition-colors">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                {monthNames[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#18181b] text-slate-500 dark:text-[#71717a] transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-[#e5e7eb] dark:border-[#27272a]">
              {dayNames.map(d => (
                <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-slate-400 dark:text-[#71717a] uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-20 border-b border-r border-[#e5e7eb] dark:border-[#1f1f23] bg-slate-50/50 dark:bg-[#09090b]/50" />;
                }

                const events = getEventsForDay(day);
                const hasCreated = events.some(e => e.type === 'created' || e.type === 'project-created');
                const hasDue = events.some(e => e.type === 'due');
                const hasOverdue = events.some(e => e.type === 'due' && e.status !== 'Done' && new Date(year, month, day) < today);
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className={`h-20 border-b border-r border-[#e5e7eb] dark:border-[#1f1f23] flex flex-col items-center pt-2 gap-1 transition-all relative group cursor-pointer
                      ${isSelected ? 'bg-[#5e6ad2]/10 dark:bg-[#5e6ad2]/15' : 'hover:bg-slate-50 dark:hover:bg-[#18181b]/50'}
                    `}
                  >
                    <span className={`text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors
                      ${isToday(day) ? 'bg-[#5e6ad2] text-white font-semibold' : ''}
                      ${isSelected && !isToday(day) ? 'text-[#5e6ad2] dark:text-[#818cf8] font-semibold' : ''}
                      ${!isToday(day) && !isSelected ? 'text-slate-700 dark:text-[#e4e4e7]' : ''}
                    `}>
                      {day}
                    </span>

                    {/* Event Dots */}
                    {events.length > 0 && (
                      <div className="flex items-center gap-1">
                        {hasCreated && <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />}
                        {hasDue && !hasOverdue && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        {hasOverdue && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                      </div>
                    )}

                    {events.length > 0 && (
                      <span className="text-[9px] font-medium text-slate-400 dark:text-[#71717a]">
                        {events.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 px-5 py-3 border-t border-[#e5e7eb] dark:border-[#27272a]">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#71717a]">
                <span className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
                Created
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#71717a]">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Due
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#71717a]">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Overdue
              </div>
            </div>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="lg:col-span-1">
          <div className="card h-full min-h-[400px]">
            {selectedDay ? (
              <>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#e5e7eb] dark:border-[#27272a]">
                  <CalendarIcon size={16} className="text-[#5e6ad2]" />
                  <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">
                    {monthNames[month]} {selectedDay}, {year}
                  </h3>
                </div>

                {selectedDayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center mb-3">
                      <CalendarIcon size={18} className="text-slate-400 dark:text-[#71717a]" />
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-[#71717a]">No events on this day</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-y-auto max-h-[500px]">
                    {selectedDayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-colors ${
                          event.type === 'due' && event.status !== 'Done'
                            ? 'border-amber-500/30 bg-amber-500/5 dark:border-amber-500/20 dark:bg-amber-500/5'
                            : event.type === 'project-created'
                            ? 'border-emerald-500/30 bg-emerald-500/5 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                            : 'border-[#e5e7eb] dark:border-[#27272a] bg-slate-50 dark:bg-[#18181b]'
                        }`}
                      >
                        {/* Event type tag */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {event.type === 'created' && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5e6ad2] flex items-center gap-1">
                              <Clock size={10} /> Task Created
                            </span>
                          )}
                          {event.type === 'due' && (
                            <span className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                              event.status === 'Done' ? 'text-emerald-500' : 'text-amber-500'
                            }`}>
                              <AlertCircle size={10} /> Due Date
                            </span>
                          )}
                          {event.type === 'project-created' && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                              <Clock size={10} /> Project Created
                            </span>
                          )}
                        </div>

                        {/* Event title */}
                        <p className="text-[13px] font-medium text-slate-900 dark:text-white leading-snug">
                          {event.label}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-2 mt-1.5">
                          {event.project && (
                            <span className="text-[10px] font-medium text-slate-400 dark:text-[#71717a] uppercase tracking-wider">
                              {event.project}
                            </span>
                          )}
                          {event.status && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-[#71717a]">
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(event.status)}`} />
                              {event.status}
                            </span>
                          )}
                          {event.priority && (
                            <span className={`text-[10px] font-medium ${getPriorityColor(event.priority)}`}>
                              {event.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center mb-3">
                  <CalendarIcon size={20} className="text-slate-400 dark:text-[#71717a]" />
                </div>
                <h3 className="text-[14px] font-medium text-slate-900 dark:text-white mb-1">Select a day</h3>
                <p className="text-[12px] text-slate-500 dark:text-[#71717a]">Click on any day to see tasks created and due on that date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
