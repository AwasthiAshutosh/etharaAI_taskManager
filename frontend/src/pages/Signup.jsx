import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Shield, Loader2, CheckSquare, Moon, Sun, Eye, EyeOff, Check } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    adminSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password, formData.role, formData.adminSecret);
      toast.success(`Welcome to Ethara.AI, ${formData.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#111113] transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-full bg-white/80 dark:bg-[#1e1e22]/80 backdrop-blur-md border border-[#e5e7eb] dark:border-[#2a2a2e] shadow-lg hover:shadow-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 group"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} className="group-hover:rotate-45 transition-transform duration-300" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform duration-300" />}
      </button>

      {/* ─── Left Blue Panel ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-b from-[#1e6cdb] via-[#2a7ae9] to-[#3d8ef0] dark:from-[#0f2a5c] dark:via-[#163d7a] dark:to-[#1b4d9a]">
        {/* Wave SVGs */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ height: '200px' }}>
          <path d="M0,120 C60,80 120,160 200,120 C280,80 340,140 400,110 C440,95 470,100 500,90 L500,200 L0,200 Z" fill="rgba(255,255,255,0.08)" />
          <path d="M0,150 C80,110 150,180 250,140 C350,100 400,160 500,130 L500,200 L0,200 Z" fill="rgba(255,255,255,0.06)" />
          <path d="M0,170 C100,140 180,190 300,160 C380,140 440,170 500,155 L500,200 L0,200 Z" fill="rgba(255,255,255,0.04)" />
        </svg>

        {/* Wavy right edge divider */}
        <svg className="absolute top-0 right-0 h-full z-20 translate-x-[1px]" viewBox="0 0 80 800" preserveAspectRatio="none" style={{ width: '80px' }}>
          <path d="M80,0 L80,800 L40,800 C40,800 80,720 40,640 C0,560 80,480 40,400 C0,320 80,240 40,160 C0,80 40,0 40,0 Z" className="fill-white dark:fill-[#111113]" />
        </svg>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <p className="text-white/70 text-[17px] font-light tracking-wide mb-6 auth-stagger-1">Welcome to</p>

          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-5 shadow-xl auth-stagger-2">
            <CheckSquare size={36} className="text-white" />
          </div>

          <h1 className="text-[32px] font-bold text-white tracking-tight mb-8 auth-stagger-3">
            Ethara.AI
          </h1>

          <p className="text-white/50 text-[14px] leading-relaxed max-w-[280px] auth-stagger-4">
            Streamline your team's workflow with intelligent task management. Track projects, collaborate seamlessly, and deliver on time.
          </p>

          {/* Bottom */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
            <span className="text-[11px] text-white/30 uppercase tracking-widest">Task Manager</span>
            <span className="text-[11px] text-white/20">|</span>
            <span className="text-[11px] text-white/30 uppercase tracking-widest">Ethara.AI</span>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-16 py-12 relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#2a7ae9] flex items-center justify-center">
            <CheckSquare size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">Ethara<span className="text-[#2a7ae9]">.AI</span></span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-10 auth-stagger-1">
            <h2 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
              Create your account
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-stagger-2">
            {/* Name */}
            <div>
              <label className="block text-[14px] font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full bg-transparent border-b-2 border-slate-200 dark:border-[#2a2a2e] focus:border-[#2a7ae9] px-1 py-3 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#555] focus:outline-none transition-colors duration-200"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formData.name.length >= 2 && (
                  <Check size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2a7ae9]" />
                )}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginTop: '28px' }}>
              <label className="block text-[14px] font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-mail Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full bg-transparent border-b-2 border-slate-200 dark:border-[#2a2a2e] focus:border-[#2a7ae9] px-1 py-3 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#555] focus:outline-none transition-colors duration-200"
                  placeholder="Enter your mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formData.email.includes('@') && formData.email.includes('.') && (
                  <Check size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2a7ae9]" />
                )}
              </div>
            </div>

            {/* Password */}
            <div style={{ marginTop: '28px' }}>
              <label className="block text-[14px] font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full bg-transparent border-b-2 border-slate-200 dark:border-[#2a2a2e] focus:border-[#2a7ae9] px-1 py-3 pr-20 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#555] focus:outline-none transition-colors duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {formData.password.length >= 6 && (
                    <Check size={18} className="text-[#2a7ae9]" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selector */}
            <div style={{ marginTop: '28px' }}>
              <label className="block text-[14px] font-medium text-slate-700 dark:text-slate-300 mb-3">
                Role
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Member' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold border-2 transition-all duration-200 ${
                    formData.role === 'Member'
                    ? 'border-[#2a7ae9] bg-[#2a7ae9]/5 dark:bg-[#2a7ae9]/10 text-[#2a7ae9]'
                    : 'border-slate-200 dark:border-[#2a2a2e] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[#3a3a3e]'
                  }`}
                >
                  <User size={14} />
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Admin' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold border-2 transition-all duration-200 ${
                    formData.role === 'Admin'
                    ? 'border-[#2a7ae9] bg-[#2a7ae9] text-white shadow-md shadow-[#2a7ae9]/25'
                    : 'border-slate-200 dark:border-[#2a2a2e] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[#3a3a3e]'
                  }`}
                >
                  <Shield size={14} />
                  Admin
                </button>
              </div>
            </div>

            {/* Admin Secret */}
            {formData.role === 'Admin' && (
              <div style={{ marginTop: '24px' }} className="animate-slide-in">
                <label className="block text-[14px] font-medium text-amber-600 dark:text-amber-400 mb-2">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full bg-transparent border-b-2 border-amber-300/50 dark:border-amber-800/30 focus:border-amber-500 px-1 py-3 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#555] focus:outline-none transition-colors duration-200"
                    placeholder="Enter the secret admin key"
                    value={formData.adminSecret}
                    onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                  />
                </div>
                <p className="mt-2 text-[12px] text-amber-600/70 dark:text-amber-400/60">
                  Demo key: <span className="font-bold font-mono">ethara_admin_key</span>
                </p>
              </div>
            )}



            {/* Buttons */}
            <div style={{ marginTop: '36px' }} className="flex items-center gap-4 auth-stagger-3">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-3.5 bg-[#2a7ae9] hover:bg-[#1e6cdb] active:bg-[#1a5fc0] text-white rounded-full text-[16px] font-semibold transition-all duration-200 shadow-md shadow-[#2a7ae9]/25 hover:shadow-lg hover:shadow-[#2a7ae9]/30 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign Up'}
              </button>
              <Link
                to="/login"
                className="px-12 py-3.5 bg-transparent border-2 border-slate-200 dark:border-[#2a2a2e] text-slate-600 dark:text-slate-400 hover:border-[#2a7ae9] hover:text-[#2a7ae9] rounded-full text-[16px] font-semibold transition-all duration-200 min-w-[140px] text-center"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
