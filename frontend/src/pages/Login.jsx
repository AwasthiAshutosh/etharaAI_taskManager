import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email) => {
    const password = email === 'admin@etharaai.com' ? 'admin123' : 'member123';
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden w-full">
      
      {/* Background ambient light (Linear style) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#5e6ad2] opacity-[0.05] dark:opacity-[0.15] blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-slide-in">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#0e0e11] shadow-sm flex items-center justify-center text-slate-900 dark:text-white font-bold">
            E
          </div>
        </div>
        <h2 className="mt-2 text-center text-[26px] font-semibold text-slate-900 dark:text-white tracking-tight">
          Log in to Ethara.AI
        </h2>
        <p className="mt-2 text-center text-[15px] text-slate-500 dark:text-[#a1a1aa]">
          Manage your tasks with precision.
        </p>
      </div>

      <div className="mt-8 w-full max-w-[440px] relative z-10 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white dark:bg-[#0e0e11] border border-[#e5e7eb] dark:border-[#27272a] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-xl px-5 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-[14px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`w-full bg-[#f9fafb] dark:bg-[#18181b] border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#e5e7eb] dark:border-[#27272a] focus:border-[#5e6ad2] dark:focus:border-[#5e6ad2]'} rounded-md px-3.5 py-2.5 text-[15px] text-slate-900 dark:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] transition-colors`}
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-[14px] font-medium text-slate-700 dark:text-[#a1a1aa] mb-2 flex justify-between">
                <span>Password</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`w-full bg-[#f9fafb] dark:bg-[#18181b] border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-[#e5e7eb] dark:border-[#27272a] focus:border-[#5e6ad2] dark:focus:border-[#5e6ad2]'} rounded-md px-3.5 py-2.5 text-[15px] text-slate-900 dark:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] transition-colors`}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1.5 text-[12px] text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#5e6ad2] hover:bg-[#4e5abf] text-white rounded-md py-2.5 px-4 text-[15px] font-medium transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.1)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Continue'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#e5e7eb] dark:border-[#27272a]">
            <p className="text-[13px] text-center text-slate-500 dark:text-[#71717a] mb-4">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleDemoLogin('admin@etharaai.com')}
                className="w-full bg-white dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] hover:bg-[#f9fafb] dark:hover:bg-[#202024] text-slate-700 dark:text-[#a1a1aa] rounded-md py-2 text-[14px] font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.2)]"
                type="button"
              >
                Admin
              </button>
              <button
                onClick={() => handleDemoLogin('jordan@etharaai.com')}
                className="w-full bg-white dark:bg-[#18181b] border border-[#e5e7eb] dark:border-[#27272a] hover:bg-[#f9fafb] dark:hover:bg-[#202024] text-slate-700 dark:text-[#a1a1aa] rounded-md py-2 text-[14px] font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.2)]"
                type="button"
              >
                Member
              </button>
            </div>
            
            <p className="text-center text-[14px] text-slate-500 dark:text-[#a1a1aa]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#5e6ad2] hover:text-[#7c89f8] font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[12px] text-slate-400 dark:text-[#71717a]">
          Ethara.AI Team Project & Task Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
