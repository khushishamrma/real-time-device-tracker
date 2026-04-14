import { motion } from 'framer-motion';
import { MapPin, Clock, Trash2, Gauge, Smartphone } from 'lucide-react';

function timeAgo(date) {
  if (!date) return 'Never';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function DeviceCard({ device, onSelect, onDelete, selected }) {
  const isOnline = device.status === 'online';
  const color = device.color || '#22d3ee';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={() => onSelect?.(device)}
      className={`relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group overflow-hidden
        ${selected
          ? 'bg-brand-500/8 border-brand-500/30'
          : 'bg-surface-800 border-surface-700 hover:border-surface-600 hover:bg-surface-750'}`}
    >
      {/* Colored left accent bar */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300"
        style={{ background: isOnline ? color : '#334155', opacity: selected ? 1 : 0.5 }} />

      <div className="flex items-start gap-3 pl-2">
        {/* Device icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
          style={{
            background: isOnline ? `${color}15` : '#1e293b',
            border: `1px solid ${isOnline ? `${color}30` : '#334155'}`,
          }}>
          <Smartphone size={15} style={{ color: isOnline ? color : '#64748b' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm text-white truncate">{device.name}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isOnline && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide
                ${isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                {isOnline ? 'LIVE' : 'OFF'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-0.5">{device.model || 'Generic Device'}</p>

          <div className="flex items-center gap-3 mt-2">
            {device.lastLocation ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <MapPin size={10} style={{ color }} />
                {device.lastLocation.lat.toFixed(4)}, {device.lastLocation.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-[11px] text-slate-600 italic">No location yet</span>
            )}
            {device.speed > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Gauge size={10} className="text-amber-400" />
                {(device.speed * 3.6).toFixed(0)} km/h
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            <Clock size={9} className="text-slate-600" />
            <span className="text-[11px] text-slate-600">{timeAgo(device.lastSeen)}</span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(device._id); }}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
