import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { moodAPI, chatAPI } from '../services/api';
import { StatCard } from '../components/UI';
import { HiChat, HiCalendar, HiHeart, HiUsers, HiBookOpen, HiSparkles, HiTrendingUp, HiClock } from 'react-icons/hi';

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];

const quickActions = [
  { to: '/chat', icon: HiChat, label: 'Chat with AI', desc: 'Talk to MindMate', color: 'from-primary-500 to-primary-700' },
  { to: '/appointments', icon: HiCalendar, label: 'Book Session', desc: 'See a counsellor', color: 'from-mint-500 to-mint-700' },
  { to: '/mood', icon: HiHeart, label: 'Check In', desc: 'Log your mood', color: 'from-coral-400 to-coral-600' },
  { to: '/community', icon: HiUsers, label: 'Community', desc: 'Connect with peers', color: 'from-purple-500 to-purple-700' },
  { to: '/resources', icon: HiBookOpen, label: 'Resources', desc: 'Self-help library', color: 'from-blue-500 to-blue-700' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

function StudentDashboard({ user }) {
  const [todayMood, setTodayMood] = useState(null);
  const [stats, setStats] = useState({ chats: 0, moodAvg: 0, streak: 0 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moodRes, chatRes] = await Promise.allSettled([
        moodAPI.getToday(),
        chatAPI.getHistory()
      ]);
      if (moodRes.status === 'fulfilled') setTodayMood(moodRes.value.data);
      if (chatRes.status === 'fulfilled') setStats(prev => ({ ...prev, chats: chatRes.value.data.sessions?.length || 0 }));
    } catch (e) {
      console.log('Dashboard data load:', e);
    }
  };

  return (
    <div className="space-y-8">
      {/* ═══ GREETING ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-dark-500 dark:text-dark-400 font-medium">How are you feeling today? Let's make today a good day.</p>
      </motion.div>

      {/* ═══ DAILY CHECK-IN BANNER ═══ */}
      {!todayMood?.hasCheckedIn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glass-card !p-5 border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/5"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <HiSparkles className="text-primary-500 w-6 h-6" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">Daily Check-in</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm">How are you feeling right now?</p>
              </div>
            </div>
            <Link to="/mood" className="btn-primary !py-2.5 !px-6 text-sm">
              Check In →
            </Link>
          </div>
        </motion.div>
      )}

      {todayMood?.hasCheckedIn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glass-card !p-5 border-l-4 border-l-primary-500 bg-primary-50/20 dark:bg-primary-900/5"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.3 }}
            >
              {moodEmojis[(todayMood.entry?.moodScore || 3) - 1]}
            </motion.div>
            <div>
              <h3 className="font-bold text-primary-700 dark:text-primary-300">Today's Check-in Complete ✓</h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                You logged a mood of {todayMood.entry?.moodScore}/5
                {todayMood.entry?.note && ` — "${todayMood.entry.note}"`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ QUICK ACTIONS ═══ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {quickActions.map((action) => (
          <motion.div key={action.to} variants={itemVariants}>
            <Link
              to={action.to}
              className="glass-card card-hover flex flex-col items-center text-center !p-5 group"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg flex items-center justify-center mb-3`}
              >
                <action.icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-bold text-sm">{action.label}</h3>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">{action.desc}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ STATS ROW ═══ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard label="Chat Sessions" value={stats.chats} icon={HiChat} color="primary" />
        <StatCard label="Mood Average" value={todayMood?.entry?.moodScore || '—'} icon={HiTrendingUp} color="mint" />
        <StatCard label="Your Streak" value="🔥 1 day" icon={HiSparkles} color="coral" />
        <StatCard label="Member Since" value={new Date(user?.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })} icon={HiClock} color="primary" />
      </motion.div>

      {/* ═══ CRISIS BANNER ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card crisis-pulse text-center !py-4"
      >
        <p className="text-sm text-dark-600 dark:text-dark-400 font-medium">
          🆘 <strong>In crisis?</strong> You're not alone. Call <strong className="text-coral-500">988</strong> • Text HOME to <strong className="text-coral-500">741741</strong> • Emergency: <strong className="text-coral-500">911</strong>
        </p>
      </motion.div>
    </div>
  );
}

import CounsellorDashboard from './CounsellorDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'counsellor') {
    return <CounsellorDashboard />;
  }
  return <StudentDashboard user={user} />;
}
