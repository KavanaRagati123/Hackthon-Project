import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenu, HiX, HiMoon, HiSun, HiLogout, HiUser, HiChat, HiCalendar, HiBookOpen, HiUsers, HiChartBar, HiHeart, HiCog } from 'react-icons/hi';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: HiChartBar, roles: ['student', 'counsellor', 'admin'] },
  { to: '/chat', label: 'AI Chat', icon: HiChat, roles: ['student'] },
  { to: '/appointments', label: 'Appointments', icon: HiCalendar, roles: ['student', 'counsellor', 'admin'] },
  { to: '/resources', label: 'Resources', icon: HiBookOpen, roles: ['student', 'counsellor', 'admin'] },
  { to: '/community', label: 'Community', icon: HiUsers, roles: ['student', 'counsellor'] },
  { to: '/mood', label: 'Mood Tracker', icon: HiHeart, roles: ['student'] },
  { to: '/admin', label: 'Admin', icon: HiCog, roles: ['admin'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const filteredLinks = navLinks.filter(link => 
    user && link.roles.includes(user.role)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-dark-200/40 dark:border-dark-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20"
            >
              <span className="text-white font-bold text-lg">M</span>
            </motion.div>
            <span className="text-xl font-bold gradient-text hidden sm:block tracking-tight">MindMate</span>
          </Link>

          {/* Desktop Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {filteredLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-primary-700 dark:text-primary-300' 
                        : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100 hover:bg-dark-100/60 dark:hover:bg-dark-800/40'
                      }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-primary-500/8 dark:bg-primary-500/12 rounded-lg"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-dark-100/60 dark:hover:bg-dark-800/40 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <HiSun className="w-5 h-5 text-amber-400" />
              ) : (
                <HiMoon className="w-5 h-5 text-dark-500" />
              )}
            </motion.button>

            {/* Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-100/60 dark:hover:bg-dark-800/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-dark-700 dark:text-dark-300">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 glass-card !p-2"
                    >
                      <div className="px-3 py-2 border-b border-dark-200/50 dark:border-dark-700/50 mb-1">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-xs text-dark-500">{user.email}</p>
                        <span className="badge-primary mt-1">{user.role}</span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-dark-100/60 dark:hover:bg-dark-800/40 transition-colors"
                      >
                        <HiUser className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10 transition-colors"
                      >
                        <HiLogout className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-dark-100/60 dark:hover:bg-dark-800/40 transition-colors"
              >
                {mobileOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/90 dark:bg-dark-950/90 backdrop-blur-xl border-t border-dark-200/40 dark:border-dark-800/40"
          >
            <div className="px-4 py-2 space-y-1">
              {filteredLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${location.pathname === to 
                      ? 'bg-primary-500/8 text-primary-700 dark:text-primary-300' 
                      : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100/60 dark:hover:bg-dark-800/40'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
