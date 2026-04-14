import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Eye, EyeOff, Loader2, ArrowRight, MapPin, Shield, Zap } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/auth.store';

const features = [
  { icon: MapPin, text: 'Real-time GPS tracking' },
  { icon: Shield, text: 'Geofence alerts' },
  { icon: Zap, text: 'Instant notifications' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex overflow-hidden">
      {/* Left — Animated background panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-surface-900 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-500/8 blur-[100px] animate-pulse-slow" style={{ top: '10%', left: '10%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-accent-500/8 blur-[100px] animate-pulse-slow" style={{ bottom: '10%', right: '5%', animationDelay: '1.5s' }} />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-emerald-500/8 blur-[80px] animate-pulse-slow" style={{ top: '50%', left: '50%', animationDelay: '3s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Radio size={24} className="text-white" />
              </div>
              <span className="font-display text-3xl font-bold text-white tracking-tight">Trackr</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
              Track your devices<br />
              <span className="text-brand-400">everywhere.</span>
            </h2>
            <p className="text-slate-400 text-base mb-8 leading-relaxed">
              Monitor your fleet, set geofences, and get instant alerts — all from one beautiful dashboard.
            </p>
            <div className="space-y-4">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.div key={text}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Icon size={15} className="text-brand-400" />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* Mobile background effects */}
        <div className="lg:hidden fixed inset-0">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', damping: 25 }}
          className="relative w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Radio size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">Trackr</span>
          </div>

          <div className="bg-surface-900/80 backdrop-blur-md border border-surface-700 rounded-2xl p-8 shadow-2xl shadow-black/20">
            <h2 className="font-display text-xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in to your dashboard</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">!</div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input
                  type="email" value={form.email} required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={form.password} required
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
                  : <>Sign In <ArrowRight size={15} /></>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              No account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
