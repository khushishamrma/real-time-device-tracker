import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, Shield, Wifi, WifiOff, Check, CheckCheck,
  Trash2, Filter, Search, X, AlertTriangle, Clock
} from 'lucide-react';
import { useAlertStore } from '../store/alert.store';
import api from '../services/api';

const typeConfig = {
  enter: { icon: Shield, label: 'Geofence Entry', color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  exit: { icon: AlertTriangle, label: 'Geofence Exit', color: 'purple', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  offline: { icon: WifiOff, label: 'Device Offline', color: 'red', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  online: { icon: Wifi, label: 'Device Online', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AlertsPage() {
  const { alerts, setAlerts, markRead, markAllRead, unreadCount } = useAlertStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/alerts').then((r) => setAlerts(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRead = async (id) => {
    markRead(id);
    try { await api.patch(`/alerts/${id}/read`); } catch {}
  };

  const handleReadAll = async () => {
    markAllRead();
    try { await api.patch('/alerts/mark-all-read'); } catch {}
  };

  const filtered = alerts.filter((a) => {
    if (filter === 'unread' && a.read) return false;
    if (filter !== 'all' && filter !== 'unread' && a.type !== filter) return false;
    if (search && !a.message?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeCounts = {};
  alerts.forEach((a) => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; });

  const filterOptions = [
    { key: 'all', label: 'All', count: alerts.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'enter', label: 'Entries', count: typeCounts.enter || 0 },
    { key: 'exit', label: 'Exits', count: typeCounts.exit || 0 },
    { key: 'online', label: 'Online', count: typeCounts.online || 0 },
    { key: 'offline', label: 'Offline', count: typeCounts.offline || 0 },
  ];

  return (
    <div className="h-full flex flex-col p-6 gap-5 overflow-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-display font-bold text-white">Alerts & Activity</h1>
          <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleReadAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 border border-surface-600 text-xs text-slate-300 font-medium rounded-lg transition-colors">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        {[
          { label: 'Total Alerts', value: alerts.length, icon: Bell, gradient: 'from-brand-500/20 to-brand-500/5' },
          { label: 'Unread', value: unreadCount, icon: BellOff, gradient: 'from-amber-500/20 to-amber-500/5' },
          { label: 'Geofence', value: (typeCounts.enter || 0) + (typeCounts.exit || 0), icon: Shield, gradient: 'from-purple-500/20 to-purple-500/5' },
          { label: 'Connectivity', value: (typeCounts.online || 0) + (typeCounts.offline || 0), icon: Wifi, gradient: 'from-emerald-500/20 to-emerald-500/5' },
        ].map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bg-gradient-to-br ${stat.gradient} border border-surface-700 rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={14} className="text-slate-500" />
              <span className="text-lg font-display font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 bg-surface-900 border border-surface-700 rounded-lg p-1">
          {filterOptions.map((opt) => (
            <button key={opt.key} onClick={() => setFilter(opt.key)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                ${filter === opt.key
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-surface-800'}`}>
              {opt.label}
              {opt.count > 0 && <span className="ml-1 opacity-60">({opt.count})</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alerts..."
            className="w-full pl-8 pr-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
              <X size={12} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16">
              <Bell size={36} className="text-slate-800 mx-auto mb-3" />
              <p className="text-slate-600 text-sm font-medium">
                {search ? 'No alerts match your search' : 'No alerts yet'}
              </p>
              <p className="text-slate-700 text-xs mt-1">Alerts will appear when devices trigger geofences or go offline</p>
            </motion.div>
          )}
          {filtered.map((alert, i) => {
            const config = typeConfig[alert.type] || typeConfig.enter;
            const Icon = config.icon;
            return (
              <motion.div key={alert._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.02 }}
                className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200
                  ${!alert.read
                    ? `bg-surface-800/80 ${config.border} hover:bg-surface-800`
                    : 'bg-surface-900 border-surface-700 opacity-60 hover:opacity-80'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon size={15} className={config.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}>
                      {config.label}
                    </span>
                    {!alert.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock size={10} className="text-slate-600" />
                    <span className="text-[11px] text-slate-600">
                      {timeAgo(alert.createdAt)} · {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {!alert.read && (
                  <button onClick={() => handleRead(alert._id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-surface-700 text-slate-500 hover:text-brand-400 transition-all"
                    title="Mark as read">
                    <Check size={14} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}