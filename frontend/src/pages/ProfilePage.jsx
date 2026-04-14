import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, Clock, Smartphone, Copy, Check,
  Eye, EyeOff, Wifi, WifiOff, MapPin, Key, Calendar,
  Activity, Radio, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useDeviceStore } from '../store/device.store';
import api from '../services/api';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-surface-600 text-slate-500 hover:text-brand-400 transition-all"
      title="Copy to clipboard">
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

function DeviceKeyCell({ deviceKey }) {
  const [visible, setVisible] = useState(false);
  const masked = deviceKey ? deviceKey.slice(0, 8) + '••••••••' + deviceKey.slice(-6) : '—';
  return (
    <div className="flex items-center gap-1.5">
      <code className="text-xs font-mono text-brand-400 bg-surface-800 px-2.5 py-1 rounded-lg select-all break-all border border-surface-700">
        {visible ? deviceKey : masked}
      </code>
      <button onClick={() => setVisible(!visible)}
        className="p-1 rounded-lg hover:bg-surface-600 text-slate-500 hover:text-slate-300 transition-all flex-shrink-0"
        title={visible ? 'Hide key' : 'Reveal key'}>
        {visible ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      <CopyButton text={deviceKey} />
    </div>
  );
}

function timeAgo(date) {
  if (!date) return 'Never';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { devices } = useDeviceStore();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then((r) => setProfile(r.data.data)).catch(() => {});
  }, []);

  const online = devices.filter((d) => d.status === 'online').length;
  const offline = devices.length - online;

  const infoItems = [
    { icon: User, label: 'Full Name', value: profile?.name || user?.name || '—' },
    { icon: Mail, label: 'Email', value: profile?.email || user?.email || '—' },
    { icon: Shield, label: 'Role', value: (profile?.role || user?.role || 'user').toUpperCase(), badge: true },
    { icon: Calendar, label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
    { icon: Clock, label: 'Last Login', value: profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Current session' },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden">
          <div className="h-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 via-accent-500/15 to-surface-900" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
            {/* Floating orbs */}
            <div className="absolute w-32 h-32 rounded-full bg-brand-500/15 blur-[50px] -top-10 right-20" />
            <div className="absolute w-24 h-24 rounded-full bg-accent-500/15 blur-[40px] -bottom-10 left-20" />
          </div>
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold font-display border-4 border-surface-900 shadow-xl shadow-brand-500/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="pb-1 flex-1">
                <h1 className="text-xl font-display font-bold text-white">{user?.name || 'User'}</h1>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 pb-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Activity size={12} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Devices', value: devices.length, icon: Smartphone, gradient: 'from-brand-500/20 to-brand-500/5', iconColor: 'text-brand-400' },
            { label: 'Online', value: online, icon: Wifi, gradient: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
            { label: 'Offline', value: offline, icon: WifiOff, gradient: 'from-red-500/20 to-red-500/5', iconColor: 'text-red-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`bg-gradient-to-br ${stat.gradient} border border-surface-700 rounded-2xl p-4 card-hover`}>
              <div className="flex items-center justify-between mb-2">
                <stat.icon size={15} className={stat.iconColor} />
                <span className="text-2xl font-display font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-700 flex items-center gap-2">
            <User size={14} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-white font-display">Account Information</h2>
          </div>
          <div className="divide-y divide-surface-700">
            {infoItems.map(({ icon: Icon, label, value, badge }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface-800 flex items-center justify-center border border-surface-700">
                    <Icon size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm text-slate-400">{label}</span>
                </div>
                {badge ? (
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 tracking-wider border border-brand-500/20">
                    {value}
                  </span>
                ) : (
                  <span className="text-sm text-white font-medium">{value}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Devices & Keys */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-white font-display">Devices & API Keys</h2>
            </div>
            <span className="text-xs text-slate-600 bg-surface-800 px-2.5 py-1 rounded-lg border border-surface-700">
              {devices.length} device{devices.length !== 1 ? 's' : ''}
            </span>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-3">
                <Smartphone size={24} className="text-slate-700" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No devices registered yet</p>
              <p className="text-slate-600 text-xs mt-1">Add a device from the dashboard to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {devices.map((device, i) => {
                const color = device.color || '#22d3ee';
                const isOnline = device.status === 'online';
                return (
                  <motion.div key={device._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.04 }}
                    className="px-5 py-4 hover:bg-surface-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                          <Smartphone size={16} style={{ color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white truncate">{device.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOnline
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-500 border border-slate-500/10'
                            }`}>
                              {isOnline ? '● LIVE' : 'OFFLINE'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{device.model || 'Unknown Model'}</p>

                          {device.lastLocation && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-600">
                              <MapPin size={11} style={{ color }} />
                              <span className="font-mono">{device.lastLocation.lat?.toFixed(4)}, {device.lastLocation.lng?.toFixed(4)}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
                            <Clock size={11} />
                            <span>{timeAgo(device.lastSeen)}</span>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Key size={11} className="text-slate-600" />
                              <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Device Key</span>
                            </div>
                            <DeviceKeyCell deviceKey={device.deviceKey} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* GPS Tracker Link */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-brand-500/10 to-surface-900 border border-brand-500/15 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
              <Radio size={20} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white font-display mb-1">Connect a Device</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Open the GPS tracker page on your phone's browser and paste a device key to start sending live location data.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs font-mono text-brand-400 bg-surface-900/80 px-3 py-1.5 rounded-xl border border-surface-700">
                  {window.location.origin}/gps-tracker.html
                </code>
                <CopyButton text={`${window.location.origin}/gps-tracker.html`} />
                <a href="/gps-tracker.html" target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-surface-700 text-slate-500 hover:text-brand-400 transition-all">
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
