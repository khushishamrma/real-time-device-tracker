import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, WifiOff, Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useToastStore } from '../../store/toast.store';

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  online: Wifi,
  offline: WifiOff,
  geofence: Shield,
};

const colorMap = {
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  error: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', glow: 'shadow-red-500/10' },
  info: { bg: 'bg-brand-500/10', border: 'border-brand-500/30', icon: 'text-brand-400', glow: 'shadow-brand-500/10' },
  online: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  offline: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', glow: 'shadow-red-500/10' },
  geofence: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400', glow: 'shadow-amber-500/10' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 380 }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info;
          const colors = colorMap[toast.type] || colorMap.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg ${colors.bg} ${colors.border} ${colors.glow}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                <Icon size={15} className={colors.icon} />
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-xs font-semibold text-white mb-0.5">{toast.title}</p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors mt-0.5">
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
