import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Shield, Loader2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    adminSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center p-4">
      {/* Background Ambient Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5e6ad2] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#5e6ad2] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[440px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#5e6ad2] rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#5e6ad2]/20">
              E
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-2 text-[15px]">Join Ethara.AI and start managing your projects.</p>
        </div>

        <div className="bg-[#18181b]/50 backdrop-blur-xl border border-[#27272a] p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[14px] font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  required
                  style={{ paddingLeft: '44px' }}
                  className="w-full bg-[#09090b] border border-[#27272a] text-white rounded-lg pr-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] focus:border-[#5e6ad2] transition-all"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  required
                  style={{ paddingLeft: '44px' }}
                  className="w-full bg-[#09090b] border border-[#27272a] text-white rounded-lg pr-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] focus:border-[#5e6ad2] transition-all"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  minLength={6}
                  style={{ paddingLeft: '44px' }}
                  className="w-full bg-[#09090b] border border-[#27272a] text-white rounded-lg pr-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] focus:border-[#5e6ad2] transition-all"
                  placeholder="Enter a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-slate-300 mb-2 text-center">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-[#09090b] rounded-lg border border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Member' })}
                  className={`flex items-center justify-center gap-2 py-2 rounded-md text-[13px] font-medium transition-all ${
                    formData.role === 'Member' 
                    ? 'bg-[#27272a] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <User size={14} />
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Admin' })}
                  className={`flex items-center justify-center gap-2 py-2 rounded-md text-[13px] font-medium transition-all ${
                    formData.role === 'Admin' 
                    ? 'bg-[#5e6ad2] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Shield size={14} />
                  Admin
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center italic">
                {formData.role === 'Admin' 
                  ? 'Admins can create projects and assign tasks.' 
                  : 'Members can track and update their assigned tasks.'}
              </p>
            </div>

            {formData.role === 'Admin' && (
              <div className="animate-fade-in space-y-3">
                <div>
                  <label className="block text-[14px] font-medium text-amber-500/80 mb-2">Admin Secret Key</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50" size={16} />
                    <input
                      type="password"
                      required
                      style={{ paddingLeft: '44px' }}
                      className="w-full bg-[#09090b] border border-amber-900/30 text-white rounded-lg pr-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-slate-700"
                      placeholder="Enter the secret admin key"
                      value={formData.adminSecret}
                      onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[12px] text-amber-500/80 leading-relaxed">
                    Note: The admin key is shown for demo purposes to allow signups. In production, this would be hidden.
                  </p>
                  <p className="text-[12px] font-bold text-amber-500 mt-1">
                    Key: ethara_admin_key
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5e6ad2] hover:bg-[#4f5aba] text-white font-semibold py-2.5 rounded-lg text-[15px] transition-all shadow-lg shadow-[#5e6ad2]/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#27272a] pt-6">
            <p className="text-slate-400 text-[14px]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#5e6ad2] hover:text-[#7c89f8] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
