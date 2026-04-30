import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import api from '../services/api';
import {
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  UsersRound
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [taskCounts, setTaskCounts] = useState({ my: 0, all: 0 });
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const userId = user._id || user.id;
        const [myRes, allRes] = await Promise.all([
          api.get(`/tasks?assignedTo=${userId}&limit=1`),
          user?.role === 'Admin' ? api.get('/tasks?limit=1') : Promise.resolve(null),
        ]);
        setTaskCounts({
          my: myRes.data.pagination?.total || 0,
          all: allRes?.data?.pagination?.total || 0,
        });
      } catch (e) { /* silent */ }
    };
    if (user) fetchCounts();
  }, [user]);

  const workspaceItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutGrid size={24} strokeWidth={1.5} />, end: true },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={24} strokeWidth={1.5} />, end: false },
    { name: 'Team', path: '/team', icon: <UsersRound size={24} strokeWidth={1.5} />, end: true },
    { name: 'Calendar', path: '/calendar', icon: <CalendarDays size={24} strokeWidth={1.5} />, end: true },
  ];

  const taskItems = [
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={24} strokeWidth={1.5} />, end: true, count: taskCounts.my },
    ...(user?.role === 'Admin'
      ? [{ name: 'All Tasks', path: '/tasks/all', icon: <Layers size={24} strokeWidth={1.5} />, end: true, count: taskCounts.all }]
      : []),
  ];

  const closeSidebar = () => setSidebarOpen(false);

  // Shared NavLink renderer
  const renderNavItem = (item) => (
    <NavLink
      key={item.name}
      to={item.path}
      end={item.end}
      onClick={closeSidebar}
      className={({ isActive }) => {
        if (collapsed) {
          return `flex items-center justify-center h-13 w-13 rounded-xl transition-all ${isActive
            ? 'bg-[#1a1f3d] border border-[#2d3470] text-white'
            : 'text-[#5a5f82] hover:text-[#9499bb] hover:bg-[#141836]'
            }`;
        }
        return `flex items-center gap-4 pl-5 pr-4 h-13 rounded-2xl transition-all text-[16px] font-medium w-full ${isActive
          ? 'bg-gradient-to-r from-[#1e265c] to-[#151a38] border border-[#2d3470] text-white shadow-lg shadow-black/20'
          : 'text-[#8b90b0] hover:text-white border border-transparent'
          }`;
      }}
      title={collapsed ? item.name : undefined}
    >
      {({ isActive }) => (
        <>
          <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : ''}`}>
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1">{item.name}</span>
              {item.count !== undefined && (
                <span className={`text-[12px] font-bold min-w-[28px] h-[22px] flex items-center justify-center rounded-full px-2 ${isActive
                  ? 'bg-[#3b49df] text-white'
                  : 'bg-[#1c2040] text-[#5a5f82]'
                  }`}>
                  {item.count}
                </span>
              )}
              {isActive && <ChevronRight size={18} className="text-white/60 ml-1" />}
            </>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-[#080a1a] gap-3 transition-colors">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${collapsed ? 'w-[94px]' : 'w-[260px]'} flex flex-col`}
        style={{
          background: 'linear-gradient(180deg, #0b0e21 0%, #080a1a 100%)',
          paddingLeft: '20px',
          paddingRight: '20px'
        }}
      >
        {/* Logo Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center py-6' : 'pt-12 pb-12'}`} style={!collapsed ? { paddingLeft: '20px' } : {}}>
          {!collapsed && (
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5e6ad2] to-[#818cf8] flex items-center justify-center text-white text-[18px] font-bold shadow-xl shadow-[#5e6ad2]/30 flex-shrink-0">
                <CheckSquare size={24} />
              </div>
              <div className="min-w-0">
                <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight">
                  Ethara<span className="text-[#5e6ad2]">.AI</span>
                </h1>
                <p className="text-[11px] text-[#4a4f6e] leading-tight truncate font-medium">Ethara.AI Task Manager</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5e6ad2] to-[#818cf8] flex items-center justify-center text-white text-[16px] font-bold shadow-xl shadow-[#5e6ad2]/30">
              <CheckSquare size={20} />
            </div>
          )}

          {/* Collapse Toggle */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex p-2 rounded-lg text-[#4a4f6e] hover:text-[#8b90b0] hover:bg-[#141836] transition-all"
              title="Collapse sidebar"
            >
              <ChevronsLeft size={18} />
            </button>
          )}

          {/* Mobile Close */}
          <button
            className="lg:hidden p-1 rounded-md text-[#4a4f6e] hover:text-white transition-colors ml-2"
            onClick={closeSidebar}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-8">

          {/* WORKSPACE Section */}
          {!collapsed && (
            <div className="pt-10 mb-10" style={{ paddingLeft: '20px' }}>
              <p className="text-[11px] font-bold text-[#4a4f6e] uppercase tracking-[0.2em]">
                Workspace
              </p>
            </div>
          )}
          {collapsed && <div className="w-8 h-px bg-[#1c2040] mx-auto pt-8 mb-10" />}

          <nav className="flex flex-col gap-3 mb-10">
            {workspaceItems.map(item => renderNavItem(item))}
          </nav>

          {/* TASKS Section */}
          {!collapsed && (
            <div className="pt-10 mb-10" style={{ paddingLeft: '20px' }}>
              <p className="text-[11px] font-bold text-[#4a4f6e] uppercase tracking-[0.2em]">
                Tasks
              </p>
            </div>
          )}
          {collapsed && <div className="w-8 h-px bg-[#1c2040] mx-auto pt-8 mb-10" />}

          <nav className="flex flex-col gap-3">
            {taskItems.map(item => renderNavItem(item))}
          </nav>
        </div>

        {/* User Card + Logout */}
        <div className={`${collapsed ? 'p-2 pb-6' : 'px-10 pb-12 pt-4'}`}>
          {!collapsed ? (
            <div className="flex flex-col bg-[#131730] border border-[#1e2348] rounded-3xl overflow-hidden shadow-xl">
              {/* User Card Tile */}
              <button
                onClick={() => setShowLogout(!showLogout)}
                className="flex items-center gap-3.5 px-5 py-4 w-full transition-colors hover:bg-white/[0.02]"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#818cf8] flex items-center justify-center text-[14px] font-bold text-white uppercase shadow-lg flex-shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-[15px] font-semibold text-white leading-tight truncate">{user?.name}</span>
                  <span className="text-[10px] font-bold text-[#5e6ad2] uppercase tracking-[0.15em] leading-tight mt-1">
                    {user?.role}
                  </span>
                </div>
                {showLogout ? <ChevronUp size={16} className="text-[#4a4f6e] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#4a4f6e] flex-shrink-0" />}
              </button>

              {/* Logout (Toggleable) */}
              {showLogout && (
                <div className="border-t border-[#1e2348] animate-fade-in">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3.5 px-6 py-4 w-full text-[14px] font-medium text-[#e85d5d] hover:bg-[#e85d5d]/10 transition-all group text-left"
                  >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#818cf8] flex items-center justify-center text-[13px] font-bold text-white uppercase shadow-lg cursor-pointer"
                title={user?.name}
                onClick={() => setShowLogout(!showLogout)}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              {showLogout && (
                <button
                  onClick={logout}
                  className="p-3 rounded-xl bg-[#e85d5d]/10 text-[#e85d5d] hover:bg-[#e85d5d]/20 transition-all shadow-lg animate-fade-in"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50 dark:bg-[#0e0e11] transition-colors my-2 mr-2 rounded-2xl">
        {/* Topbar */}
        <header className="h-14 glass flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-[#18181b]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden lg:flex p-1.5 rounded-md text-slate-400 dark:text-[#71717a] hover:text-slate-600 dark:hover:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#18181b] transition-all"
                title="Expand sidebar"
              >
                <ChevronsRight size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 sm:p-8">
          <div className="max-w-6xl mx-auto w-full pb-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
