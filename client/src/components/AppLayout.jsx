import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { FloatingBlobs } from './UI';
import { HiMenu } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-dark-50 dark:bg-dark-950 text-dark-900 dark:text-dark-100 overflow-hidden">
      {/* Animated background blobs */}
      <FloatingBlobs />

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-dark-200/50 dark:border-dark-800/50 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-lg gradient-text">MindMate</span>
          </div>
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2.5 bg-dark-100 dark:bg-dark-800 rounded-xl hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
          >
            <HiMenu className="w-5 h-5 text-dark-700 dark:text-dark-300" />
          </button>
        </div>

        {/* Scrollable Page Content */}
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto relative z-10 w-full"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
