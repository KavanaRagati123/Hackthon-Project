import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, postAPI } from '../services/api';
import { StatCard } from '../components/UI';
import { HiCalendar, HiUsers, HiVideoCamera, HiOutlineCheckCircle, HiClock } from 'react-icons/hi';

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, totalPosts: 0 });
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
      const [aptRes, postRes] = await Promise.allSettled([
        appointmentAPI.getAll({ status: 'confirmed', limit: 5 }),
        postAPI.getAll({ limit: 1 })
      ]);
      if (aptRes.status === 'fulfilled') {
        const apts = aptRes.value.data.appointments || [];
        setAppointments(apts);
        setStats(prev => ({ ...prev, upcoming: apts.length }));
      }
      if (postRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, totalPosts: postRes.value.data.total || 0 }));
      }
    } catch (e) {
      console.log('Counsellor data load error:', e);
    }
  };

  // Clean "Dr." prefix if name already has it
  const cleanedName = user?.name?.replace(/^Dr\.\s+/i, '') || 'Admin';
  const firstName = cleanedName.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* ═══ GREETING ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          {greeting}, <span className="gradient-text">Dr. {firstName}</span> 👋
        </h1>
        <p className="text-dark-500 dark:text-dark-400 font-medium">Here is your daily overview. Thank you for supporting our students.</p>
      </motion.div>

      {/* ═══ STATS ROW ═══ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard label="Upcoming Sessions" value={stats.upcoming} icon={HiCalendar} color="mint" />
        <StatCard label="Completed Sessions" value={stats.completed || 0} icon={HiOutlineCheckCircle} color="primary" />
        <StatCard label="Community Posts" value={stats.totalPosts} icon={HiUsers} color="purple" />
        <StatCard label="Joined" value={new Date(user?.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })} icon={HiClock} color="coral" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ═══ TODAY'S SCHEDULE ═══ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25, duration: 0.5 }}
          className="lg:col-span-2 glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
              <HiCalendar className="text-primary-500" /> Today's Schedule
            </h2>
            <Link to="/appointments" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-semibold transition-colors">
              View Calendar →
            </Link>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt, index) => (
                <Link 
                  key={apt._id} 
                  to="/appointments"
                  className="block"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.08 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/30 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 group relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex flex-col items-center justify-center font-bold">
                        <span className="text-sm">{new Date(apt.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-dark-800 dark:text-dark-100 group-hover:text-primary-600 transition-colors">
                          {apt.isAnonymous ? "Anonymous Student" : apt.studentId?.name || "Student"}
                        </p>
                        <span className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {apt.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {apt.meetingLink && (
                        <span className="btn-primary !px-4 !py-2 flex items-center gap-2 text-sm pointer-events-none">
                          <HiVideoCamera /> Join & Chat
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-dark-50/50 dark:bg-dark-800/20 rounded-xl border border-dashed border-dark-200 dark:border-dark-700">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                className="inline-flex w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 items-center justify-center mb-4"
              >
                <HiOutlineCheckCircle className="w-8 h-8 text-primary-500" />
              </motion.div>
              <h3 className="text-lg font-bold text-dark-700 dark:text-dark-200 mb-1">No upcoming sessions</h3>
              <p className="text-dark-500 text-sm">You have no pending appointments for today.</p>
            </div>
          )}
        </motion.div>

        {/* ═══ WORKSPACE ═══ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-xl font-bold tracking-tight">Workspace</h2>
          
          <Link to="/community" className="glass-card card-hover flex items-center gap-4 !p-4 border-l-4 border-l-purple-500">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
              <HiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Student Community</h3>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">Answer questions & offer support</p>
            </div>
          </Link>

          <Link to="/appointments" className="glass-card card-hover flex items-center gap-4 !p-4 border-l-4 border-l-primary-500">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
              <HiCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Manage Schedule</h3>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">View full calendar & sessions</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
