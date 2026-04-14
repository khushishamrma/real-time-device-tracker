import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Wifi, WifiOff, Bell, Plus, X, Loader2, Key, TrendingUp, Activity, Zap } from 'lucide-react';
import { useDeviceStore } from '../store/device.store';
import { useAlertStore } from '../store/alert.store';

import DeviceCard from '../components/Device/DeviceCard';
import AlertFeed from '../components/Alert/AlertFeed';
import LiveMap from '../components/Map/LiveMap';
import api from '../services/api';
import { getSocket } from '../services/socket';

/* ── Animated Counter ────────────────────────────────────── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === value) return;

    let start = prev;
    const step = value > prev ? 1 : -1;
    const interval = setInterval(() => {
      start += step;
      setDisplay(start);
      if (start === value) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{display}</span>;
}

/* ── Stat Card with gradient glow ────────────────────────── */
const StatCard = ({ label, value, icon: Icon, gradient, iconColor }) => (
  <div className="relative overflow-hidden bg-surface-800 border border-surface-700 rounded-2xl p-5 hover:border-surface-600 transition-all group">
    {/* Gradient glow */}
    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${gradient}`} />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-surface-700 ${iconColor}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-display font-bold text-white tracking-tight">
        <AnimatedNumber value={value} />
      </p>
    </div>
  </div>
);

export default function Dashboard() {
  const { devices, selectedDevice, setSelectedDevice, addDevice, removeDevice } = useDeviceStore();
  const { unreadCount } = useAlertStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', model: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newDeviceKey, setNewDeviceKey] = useState('');
  const [copied, setCopied] = useState(false);

  const online = devices.filter((d) => d.status === 'online').length;
  const offline = devices.length - online;

  const handleSubscribe = (device) => {
    setSelectedDevice(device);
    const s = getSocket();
    if (s) s.emit('subscribe:device', device._id);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/devices', form);
      addDevice(res.data.data);
      setNewDeviceKey(res.data.data.deviceKey);
      setForm({ name: '', model: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create device');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/devices/${id}`); removeDevice(id); } catch {}
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(newDeviceKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'Total Devices', value: devices.length, icon: Monitor, gradient: 'bg-brand-400', iconColor: 'text-brand-400' },
    { label: 'Online', value: online, icon: Wifi, gradient: 'bg-emerald-400', iconColor: 'text-emerald-400' },
    { label: 'Offline', value: offline, icon: WifiOff, gradient: 'bg-red-400', iconColor: 'text-red-400' },
    { label: 'Alerts', value: unreadCount, icon: Bell, gradient: 'bg-amber-400', iconColor: 'text-amber-400' },
  ];

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
        {/* Map */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-white">Live Map</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-brand-400" />
              <span className="text-xs text-slate-500">{online} active</span>
            </div>
          </div>
          <div style={{ height: 'calc(100% - 49px)' }}>
            <LiveMap selectedDevice={selectedDevice} />
          </div>
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Devices */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="bg-surface-900 border border-surface-700 rounded-2xl flex flex-col" style={{ maxHeight: 320 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700 flex-shrink-0">
              <span className="text-sm font-medium text-white">Devices</span>
              <button onClick={() => { setShowAddModal(true); setNewDeviceKey(''); setCopied(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 text-xs text-brand-400 hover:bg-brand-500/20 font-medium transition-colors">
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {devices.length === 0 && (
                <div className="text-center py-6 text-slate-600 text-sm">No devices yet. Add your first device.</div>
              )}
              {devices.map((d) => (
                <DeviceCard key={d._id} device={d} selected={selectedDevice?._id === d._id}
                  onSelect={handleSubscribe} onDelete={handleDelete} />
              ))}
            </div>
          </motion.div>

          {/* Alert feed */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="flex-1 bg-surface-900 border border-surface-700 rounded-2xl p-4 overflow-hidden flex flex-col min-h-0">
            <AlertFeed />
          </motion.div>
        </div>
      </div>

      {/* Add device modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-white">Add Device</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg hover:bg-surface-700 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {newDeviceKey ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Key size={24} className="text-emerald-400" />
                  </motion.div>
                  <p className="text-white font-semibold text-lg mb-1">Device Created! 🎉</p>
                  <p className="text-slate-400 text-sm mb-4">Copy this key — you'll need it to connect.</p>
                  <div onClick={handleCopyKey}
                    className="bg-surface-800 border border-surface-600 rounded-xl p-4 font-mono text-sm text-brand-400 break-all mb-4 cursor-pointer hover:border-brand-500/40 transition-colors relative group">
                    {newDeviceKey}
                    <span className="absolute top-2 right-2 text-[10px] text-slate-600 group-hover:text-brand-400 transition-colors">
                      {copied ? '✓ Copied' : 'Click to copy'}
                    </span>
                  </div>
                  <button onClick={() => setShowAddModal(false)}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdd} className="space-y-4">
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {[
                    { key: 'name', label: 'Device Name', placeholder: 'My Phone', required: true },
                    { key: 'model', label: 'Model', placeholder: 'Samsung S24, iPhone 15...', required: false },
                    { key: 'description', label: 'Description', placeholder: 'Optional notes', required: false },
                  ].map(({ key, label, placeholder, required }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        {label} {required && <span className="text-brand-400">*</span>}
                      </label>
                      <input value={form[key]} required={required} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all" />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 bg-surface-700 hover:bg-surface-600 text-slate-300 text-sm font-medium rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                      {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><Zap size={14} /> Create</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
