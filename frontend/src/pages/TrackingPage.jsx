import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, WifiOff, Clock, Gauge, Radio, Navigation, Activity, Zap, Signal } from 'lucide-react';
import { useDeviceStore } from '../store/device.store';
import DeviceCard from '../components/Device/DeviceCard';
import LiveMap from '../components/Map/LiveMap';
import { getSocket } from '../services/socket';

function SpeedGauge({ speed = 0, maxSpeed = 120 }) {
  const pct = Math.min(speed / maxSpeed, 1);
  const angle = -135 + pct * 270;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct * 0.75 * circumference);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-[135deg]">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#161e35" strokeWidth="6"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeLinecap="round" />
        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="6"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={dashOffset} strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          stroke={speed > 80 ? '#ef4444' : speed > 40 ? '#f59e0b' : '#22d3ee'} />
      </svg>
      <div className="text-center z-10">
        <p className="text-2xl font-display font-bold text-white leading-none">
          {speed.toFixed(0)}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">km/h</p>
      </div>
    </div>
  );
}

function timeAgo(date) {
  if (!date) return 'Never';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 5) return 'Just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function LivePulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

export default function TrackingPage() {
  const { devices, selectedDevice, setSelectedDevice } = useDeviceStore();
  const [elapsed, setElapsed] = useState(0);

  const handleSelect = (device) => {
    setSelectedDevice(device);
    const s = getSocket();
    if (s) s.emit('subscribe:device', device._id);
  };

  useEffect(() => {
    const s = getSocket();
    if (s && devices.length > 0 && !selectedDevice) {
      const first = devices[0];
      setSelectedDevice(first);
      s.emit('subscribe:device', first._id);
    }
  }, [devices]);

  // Tick elapsed timer for selected device
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const dev = selectedDevice;
  const isOnline = dev?.status === 'online';
  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const speed = dev?.speed || 0;

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-surface-900 border-r border-surface-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-surface-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-white text-sm">Live Tracking</h2>
              <p className="text-xs text-slate-500 mt-0.5">{devices.length} device{devices.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-800 border border-surface-700">
              <LivePulse />
              <span className="text-xs text-emerald-400 font-medium">{onlineCount} live</span>
            </div>
          </div>
        </div>

        {/* Device list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {devices.map((d) => (
            <DeviceCard key={d._id} device={d} selected={selectedDevice?._id === d._id} onSelect={handleSelect} />
          ))}
          {devices.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-sm">Add devices from the dashboard</div>
          )}
        </div>

        {/* Live Stats Panel */}
        {dev && (
          <div className="border-t border-surface-700 bg-surface-800/50 p-4 space-y-4 flex-shrink-0">
            {/* Device header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                  <Radio size={14} className={isOnline ? 'text-emerald-400' : 'text-slate-500'} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{dev.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    {isOnline ? 'Tracking Active' : 'Offline'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-500'}`}>
                {isOnline ? 'LIVE' : 'OFF'}
              </span>
            </div>

            {/* Speed Gauge */}
            <div className="flex items-center justify-center">
              <SpeedGauge speed={speed * 3.6} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Navigation, label: 'Latitude', value: dev.lastLocation?.lat?.toFixed(5) || '—', color: 'text-brand-400' },
                { icon: Navigation, label: 'Longitude', value: dev.lastLocation?.lng?.toFixed(5) || '—', color: 'text-brand-400' },
                { icon: Signal, label: 'Status', value: isOnline ? 'Connected' : 'Disconnected', color: isOnline ? 'text-emerald-400' : 'text-red-400' },
                { icon: Clock, label: 'Last Update', value: timeAgo(dev.lastSeen), color: 'text-slate-300' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-surface-900/80 rounded-lg p-2.5 border border-surface-700">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon size={10} className="text-slate-600" />
                    <p className="text-[10px] text-slate-600 font-medium">{label}</p>
                  </div>
                  <p className={`text-xs font-mono font-medium ${color} break-all leading-snug`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <LiveMap selectedDevice={selectedDevice} />

        {/* Floating HUD */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          {/* Online badge */}
          <div className="flex items-center gap-2 bg-surface-900/90 backdrop-blur-md border border-surface-700 rounded-xl px-3.5 py-2.5 shadow-lg">
            <LivePulse />
            <span className="text-xs text-slate-300 font-medium">
              {onlineCount} online
            </span>
          </div>

          {/* Speed badge */}
          {dev && isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-surface-900/90 backdrop-blur-md border border-surface-700 rounded-xl px-3.5 py-2.5 shadow-lg"
            >
              <Zap size={13} className={speed > 2 ? 'text-amber-400' : 'text-slate-500'} />
              <span className="text-xs font-mono text-white font-medium">
                {(speed * 3.6).toFixed(1)} km/h
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
