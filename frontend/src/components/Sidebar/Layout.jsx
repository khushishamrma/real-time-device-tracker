import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MapPin, History, Shield, LogOut, Radio, Bell, Search, Command } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useAlertStore } from '../../store/alert.store';
import { useSocket } from '../../hooks/useSocket';
import { useDevices } from '../../hooks/useDevices';
import ToastContainer from '../Toast/ToastContainer';
import api from '../../services/api';
import { useEffect } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tracking', icon: MapPin, label: 'Live Tracking' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/geofences', icon: Shield, label: 'Geofences' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
];

const pageTitles = {
  '/': 'Dashboard',
  '/tracking': 'Live Tracking',
  '/history': 'History Replay',
  '/geofences': 'Geofences',
  '/alerts': 'Alerts & Activity',
  '/profile': 'Profile',
};

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const { setAlerts, setUnreadCount, unreadCount } = useAlertStore();
  const navigate = useNavigate();
  const location = useLocation();
  useSocket();
  useDevices();

  useEffect(() => {
    api.get('/alerts').then((r) => setAlerts(r.data.data)).catch(() => {});
    api.get('/alerts/unread-count').then((r) => setUnreadCount(r.data.data)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    navigate('/login');
  };

  const currentPage = pageTitles[location.pathname] || 'Trackr';

  return (
    <>
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 lg:w-60 flex flex-col bg-surface-900 border-r border-surface-700 flex-shrink-0 transition-all duration-300">
        {/* Brand */}
        <div className="h-16 flex items-center px-4 border-b border-surface-700">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
              <Radio size={17} className="text-white" />
            </div>
            <div className="hidden lg:block">
              <span className="font-display font-bold text-lg text-white tracking-tight">Trackr</span>
              <p className="text-[10px] text-slate-600 -mt-0.5 font-medium">GPS Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ' +
                (isActive
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800')
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="activeNav"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand-400"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
                  )}
                  <Icon size={18} className={isActive ? 'text-brand-400' : 'group-hover:text-slate-200'} />
                  <span className="hidden lg:block text-sm font-medium flex-1">{label}</span>
                  {label === 'Alerts' && unreadCount > 0 && (
                    <span className="hidden lg:flex min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] items-center justify-center font-bold px-1.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {label === 'Alerts' && unreadCount > 0 && (
                    <span className="lg:hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-surface-700">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer rounded-xl hover:bg-surface-800 -mx-1 px-2 py-1.5 transition-all"
              onClick={() => navigate('/profile')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500/30 to-brand-500/20 flex items-center justify-center flex-shrink-0 border border-accent-500/20">
                <span className="text-xs font-bold text-accent-400">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden lg:block flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
              title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-surface-700 bg-surface-900/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <AnimatePresence mode="wait">
                <motion.h1 key={currentPage}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="font-display text-base font-bold text-white">
                  {currentPage}
                </motion.h1>
              </AnimatePresence>
              <p className="text-[11px] text-slate-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button onClick={() => navigate('/alerts')}
              className="relative w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center border border-surface-700 transition-all">
              <Bell size={15} className="text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-lg shadow-red-500/30">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {/* User mini avatar */}
            <button onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500/20 to-brand-500/10 border border-accent-500/20 flex items-center justify-center hover:border-accent-500/40 transition-all">
              <span className="text-xs font-bold text-accent-400">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
    <ToastContainer />
    </>
  );
}
