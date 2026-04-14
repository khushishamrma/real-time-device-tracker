import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Eye, EyeOff, Loader2, ArrowRight, UserPlus, MapPin, Shield, Zap } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/auth.store';

const features = [
  { icon: MapPin, text: 'Real-time GPS tracking' },
  { icon: Shield, text: 'Geofence alerts' },
  { icon: Zap, text: 'Instant notifications' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register', form);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen bg-surface-950 flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-surface-900 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-accent-500/8 blur-[100px] animate-pulse-slow" style={{ top: '10%', right: '10%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-500/8 blur-[100px] animate-pulse-slow" style={{ bottom: '10%', left: '5%', animationDelay: '1.5s' }} />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-emerald-500/8 blur-[80px] animate-pulse-slow" style={{ top: '40%', right: '30%', animationDelay: '3s' }} />

        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 max-w-md px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-400 to-brand-500 flex items-center justify-center shadow-lg shadow-accent-500/25">
                <Radio size={24} className="text-white" />
              </div>
              <span className="font-display text-3xl font-bold text-white tracking-tight">Trackr</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
              Start tracking<br />
              <span className="text-accent-400">in minutes.</span>
            </h2>
            <p className="text-slate-400 text-base mb-8 leading-relaxed">
              Create your free account and set up your first device in under 2 minutes.
            </p>
            <div className="space-y-4">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.div key={text}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    <Icon size={15} className="text-accent-400" />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="lg:hidden fixed inset-0">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', damping: 25 }} className="relative w-full max-w-sm">

          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-brand-500 flex items-center justify-center shadow-lg shadow-accent-500/25">
              <Radio size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">Trackr</span>
          </div>

          <div className="bg-surface-900/80 backdrop-blur-md border border-surface-700 rounded-2xl p-8 shadow-2xl shadow-black/20">
            <h2 className="font-display text-xl font-bold text-white mb-1">Create account</h2>
            <p className="text-slate-500 text-sm mb-6">Start tracking your devices today</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', icon: '👤' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: '✉️' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <input type={type} value={form[key]} required
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} required minLength={8}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((level) => (
                        <div key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${passStrength >= level ? strengthColors[passStrength] : 'bg-surface-700'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-medium ${passStrength === 3 ? 'text-emerald-400' : passStrength === 2 ? 'text-amber-400' : 'text-red-400'}`}>
                      {strengthLabels[passStrength]}
                    </span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-accent-500 to-brand-500 hover:from-accent-400 hover:to-brand-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Creating account...</>
                  : <><UserPlus size={15} /> Create Account</>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
