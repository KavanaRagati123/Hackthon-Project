import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { StatCard, LoadingSpinner } from '../components/UI';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiUsers, HiChat, HiCalendar, HiFlag, HiTrendingUp, HiHeart, HiBookOpen, HiDownload, HiShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const COLORS = ['#6366F1', '#10B981', '#F97316', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [flaggedChats, setFlaggedChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dashRes, analyticsRes, flaggedRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics({ days: 30 }),
        adminAPI.getFlaggedChats()
      ]);
      setStats(dashRes.data.stats);
      setAnalytics(analyticsRes.data);
      setFlaggedChats(flaggedRes.data.chats || []);
    } catch (e) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async (type) => {
    try {
      const response = await adminAPI.exportData(type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindmate-${type}-${Date.now()}.csv`;
      link.click();
      toast.success(`${type} data exported!`);
    } catch (e) {
      toast.error('Export failed');
    }
  };

  if (loading) return <div className="pt-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <HiShieldCheck className="text-primary-500" /> Admin <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-dark-500 dark:text-dark-400">All data anonymized. Real-time platform analytics.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportCSV('users')} className="btn-ghost border border-dark-200 dark:border-dark-700 text-sm flex items-center gap-1">
                <HiDownload className="w-4 h-4" /> Users
              </button>
              <button onClick={() => exportCSV('appointments')} className="btn-ghost border border-dark-200 dark:border-dark-700 text-sm flex items-center gap-1">
                <HiDownload className="w-4 h-4" /> Appointments
              </button>
              <button onClick={() => exportCSV('moods')} className="btn-ghost border border-dark-200 dark:border-dark-700 text-sm flex items-center gap-1">
                <HiDownload className="w-4 h-4" /> Moods
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Users" value={stats.totalUsers} icon={HiUsers} color="primary" />
            <StatCard label="Active (24h)" value={stats.activeUsers24h} icon={HiTrendingUp} color="mint" />
            <StatCard label="Total Chats" value={stats.totalChats} icon={HiChat} color="primary" />
            <StatCard label="Flagged" value={stats.flaggedChats} icon={HiFlag} color="red" />
            <StatCard label="Appointments" value={stats.appointmentsTotal} icon={HiCalendar} color="coral" />
            <StatCard label="Completed" value={stats.appointmentsCompleted} icon={HiCalendar} color="mint" />
            <StatCard label="Posts" value={stats.totalPosts} icon={HiUsers} color="primary" />
            <StatCard label="Resources" value={stats.totalResources} icon={HiBookOpen} color="mint" />
            <StatCard label="Counsellors" value={stats.totalCounsellors} icon={HiHeart} color="coral" />
            <StatCard label="Avg Mood" value={stats.avgMood + '/5'} icon={HiHeart} color="primary" />
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Chat activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
            <h3 className="font-semibold mb-4">Chat Activity (30 Days)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.chatsByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="_id" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                  <YAxis fontSize={10} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: 'none', borderRadius: '12px', color: '#F9FAFB' }} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[4,4,0,0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Mood trends */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
            <h3 className="font-semibold mb-4">Average Mood Scores</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.moodsByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="_id" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                  <YAxis domain={[1, 5]} fontSize={10} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: 'none', borderRadius: '12px', color: '#F9FAFB' }} />
                  <Line type="monotone" dataKey="avgMood" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Post categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
            <h3 className="font-semibold mb-4">Post Categories</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics?.postCategories || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {(analytics?.postCategories || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: 'none', borderRadius: '12px', color: '#F9FAFB' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* User registrations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card">
            <h3 className="font-semibold mb-4">New Registrations</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.registrations || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="_id" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                  <YAxis fontSize={10} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: 'none', borderRadius: '12px', color: '#F9FAFB' }} />
                  <Bar dataKey="count" fill="#F97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Flagged Chats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <HiFlag className="text-red-500" /> Flagged Conversations ({flaggedChats.length})
          </h3>
          {flaggedChats.length === 0 ? (
            <p className="text-dark-500 text-sm py-4 text-center">No flagged conversations. All clear! ✅</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {flaggedChats.map((chat) => (
                <div key={chat._id} className="p-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      User: {chat.userId?.anonymousId || 'Anonymous'}
                    </span>
                    <span className="text-xs text-dark-400">{new Date(chat.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-dark-600 dark:text-dark-400 truncate">
                    {chat.messages?.[chat.messages.length - 1]?.content?.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
