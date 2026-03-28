import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMoon, HiSun, HiLogout, HiChartBar, HiChat, HiCalendar, HiBookOpen, HiUsers, HiHeart, HiCog, HiX } from 'react-icons/hi';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: HiChartBar, roles: ['student', 'counsellor', 'admin'] },
  { to: '/chat', label: 'AI Chat', icon: HiChat, roles: ['student'] },
  { to: '/appointments', label: 'Appointments', icon: HiCalendar, roles: ['student', 'counsellor', 'admin'] },
  { to: '/resources', label: 'Resources', icon: HiBookOpen, roles: ['student', 'counsellor', 'admin'] },
  { to: '/community', label: 'Community', icon: HiUsers, roles: ['student', 'counsellor'] },
  { to: '/mood', label: 'Mood Tracker', icon: HiHeart, roles: ['student'] },
  { to: '/admin', label: 'Admin', icon: HiCog, roles: ['admin'] },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredLinks = navLinks.filter(link => user && link.roles.includes(user.role));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/90 dark:bg-dark-900/95 backdrop-blur-xl border-r border-dark-200/40 dark:border-dark-800/40 w-[260px] relative z-40">
      
      {/* Brand */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-dark-200/30 dark:border-dark-800/30">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25"
          >
            <span className="text-white font-bold text-xl">M</span>
          </motion.div>
          <span className="text-xl font-bold gradient-text tracking-tight">MindMate</span>
        </Link>
        
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-2 text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors">
          <HiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-dark-400/70 dark:text-dark-500/70 mb-3">Menu</p>
        {filteredLinks.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'text-primary-700 dark:text-primary-300 font-semibold' 
                  : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100 hover:bg-dark-100/60 dark:hover:bg-dark-800/40'
                }`}
            >
              {/* Morphing active background with glow */}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute inset-0 bg-primary-500/8 dark:bg-primary-500/10 rounded-xl border border-primary-200/40 dark:border-primary-800/30"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              
              <motion.div
                whileHover={{ scale: 1.15, rotate: isActive ? 0 : 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="relative z-10"
              >
                <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-dark-400 group-hover:text-primary-500'}`} />
              </motion.div>
              
              <span className="relative z-10 text-[13.5px]">{label}</span>
              
              {/* Breathing online dot for AI Chat */}
              {to === '/chat' && user?.role === 'student' && (
                <span className="relative z-10 ml-auto">
                  <span className="absolute w-4 h-4 rounded-full bg-primary-400/30 animate-breathe" />
                  <span className="relative w-2 h-2 rounded-full bg-primary-500 block" />
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-dark-200/30 dark:border-dark-800/30">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2.5 w-full px-3 py-2 mb-3 text-dark-500 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100/60 dark:hover:bg-dark-800/40 rounded-xl transition-all duration-200 text-sm font-medium"
        >
          <motion.div whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }}>
            {darkMode 
              ? <HiSun className="w-5 h-5 text-amber-500" /> 
              : <HiMoon className="w-5 h-5" />
            }
          </motion.div>
          <span>{darkMode ? 'Light' : 'Dark'} Mode</span>
        </button>

        {/* User Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-50/80 dark:bg-dark-800/60 rounded-xl p-3 border border-dark-200/40 dark:border-dark-700/40"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
              <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-dark-900 dark:text-dark-100 truncate">{user?.name}</p>
              <p className="text-[11px] text-dark-500 truncate capitalize font-medium">{user?.role}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-500/10 hover:bg-coral-100 dark:hover:bg-coral-500/20 rounded-lg transition-all duration-200"
          >
            <HiLogout className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar & Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-dark-900/50 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="md:hidden fixed inset-y-0 left-0 z-40 w-[260px]"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
