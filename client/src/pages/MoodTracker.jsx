import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { moodAPI } from '../services/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/UI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { HiHeart, HiPencil, HiCheck, HiTrendingUp, HiCalendar } from 'react-icons/hi';

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];
const moodColors = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#6366F1'];

const phq4Questions = [
  { key: 'anxiety1', text: 'Feeling nervous, anxious, or on edge?', group: 'Anxiety' },
  { key: 'anxiety2', text: 'Not being able to stop or control worrying?', group: 'Anxiety' },
  { key: 'depression1', text: 'Feeling down, depressed, or hopeless?', group: 'Depression' },
  { key: 'depression2', text: 'Little interest or pleasure in doing things?', group: 'Depression' },
];

const phq4Options = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export default function MoodTracker() {
  const [moodScore, setMoodScore] = useState(3);
  const [note, setNote] = useState('');
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessment, setAssessment] = useState({ anxiety1: 0, anxiety2: 0, depression1: 0, depression2: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [todayDone, setTodayDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        moodAPI.getToday(),
        moodAPI.getHistory({ days: 30 })
      ]);
      setTodayDone(todayRes.data.hasCheckedIn);
      if (todayRes.data.entry) setMoodScore(todayRes.data.entry.moodScore);
      setHistory(historyRes.data.entries || []);
      setStats(historyRes.data.stats || null);
    } catch (e) {
      console.log('Mood data load error');
    } finally {
      setLoading(false);
    }
  };

  const submitMood = async () => {
    setSubmitting(true);
    try {
      const data = { moodScore, note };
      if (showAssessment) {
        data.assessmentScores = assessment;
      }
      await moodAPI.create(data);
      toast.success('Mood logged! 🎉');
      setTodayDone(true);
      setNote('');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to log mood');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = history.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: entry.moodScore,
    anxiety: entry.assessmentScores?.totalAnxiety,
    depression: entry.assessmentScores?.totalDepression,
  }));

  if (loading) return <div className="pt-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <HiHeart className="text-coral-500" /> Well-being <span className="gradient-text">Tracker</span>
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mb-8">Track your mood daily and understand your mental health patterns.</p>
        </motion.div>

        {/* Daily Check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {todayDone ? <HiCheck className="text-mint-500" /> : <HiPencil className="text-primary-500" />}
            {todayDone ? "Today's Check-in Complete" : "How are you feeling today?"}
          </h2>

          {!todayDone && (
            <>
              {/* Mood Slider */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-3 transition-all duration-300" style={{ transform: `scale(${1 + (moodScore - 1) * 0.1})` }}>
                  {moodEmojis[moodScore - 1]}
                </div>
                <p className="text-lg font-medium" style={{ color: moodColors[moodScore - 1] }}>
                  {moodLabels[moodScore - 1]}
                </p>
                <div className="flex items-center justify-center gap-4 mt-4 max-w-xs mx-auto">
                  <span className="text-2xl">😢</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="flex-1 accent-primary-500 h-2"
                  />
                  <span className="text-2xl">😊</span>
                </div>
              </div>

              {/* Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">What's on your mind? (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Jot down how you're feeling..."
                  className="input-field min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>

              {/* PHQ-4 Toggle */}
              <button
                onClick={() => setShowAssessment(!showAssessment)}
                className="text-primary-500 text-sm font-medium hover:text-primary-600 mb-4"
              >
                {showAssessment ? '▾ Hide' : '▸ Take'} Weekly Assessment (PHQ-4)
              </button>

              {showAssessment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 mb-6 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl"
                >
                  <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">Over the last 2 weeks, how often have you been bothered by:</p>
                  {phq4Questions.map((q) => (
                    <div key={q.key}>
                      <p className="text-sm font-medium mb-2">
                        <span className="badge-primary text-[10px] mr-2">{q.group}</span>
                        {q.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {phq4Options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setAssessment(prev => ({ ...prev, [q.key]: opt.value }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                              ${assessment[q.key] === opt.value
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-300'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              <button onClick={submitMood} disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-50">
                {submitting ? 'Saving...' : '✓ Log Mood'}
              </button>
            </>
          )}
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="glass-card text-center">
              <p className="text-2xl font-bold text-primary-500">{stats.average}</p>
              <p className="text-xs text-dark-500">Avg Mood</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-2xl font-bold text-mint-500">{stats.trend}</p>
              <p className="text-xs text-dark-500">Trend</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-2xl font-bold text-coral-500">{stats.totalEntries}</p>
              <p className="text-xs text-dark-500">Entries</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-2xl font-bold">{moodEmojis[Math.round(stats.average) - 1] || '😐'}</p>
              <p className="text-xs text-dark-500">Avg Emoji</p>
            </div>
          </div>
        )}

        {/* Mood Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card mb-8"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <HiTrendingUp className="text-primary-500" /> Mood Trend (Last 30 Days)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={11} tick={{ fill: '#9CA3AF' }} />
                  <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} fontSize={11} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(17,24,39,0.9)', border: 'none', borderRadius: '12px', color: '#F9FAFB' }}
                    formatter={(value) => [`${value}/5 ${moodEmojis[value - 1]}`, 'Mood']}
                  />
                  <Area type="monotone" dataKey="mood" stroke="#6366F1" fill="url(#moodGrad)" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* History */}
        <div className="glass-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <HiCalendar className="text-mint-500" /> Recent Entries
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice(-10).reverse().map((entry, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                <span className="text-2xl">{moodEmojis[entry.moodScore - 1]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{moodLabels[entry.moodScore - 1]}</span>
                    <span className="text-xs text-dark-400">•</span>
                    <span className="text-xs text-dark-400">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  {entry.note && <p className="text-xs text-dark-500 mt-1 truncate">{entry.note}</p>}
                </div>
                <div className="w-8 h-2 rounded-full overflow-hidden bg-dark-200 dark:bg-dark-700">
                  <div className="h-full rounded-full" style={{ width: `${entry.moodScore * 20}%`, background: moodColors[entry.moodScore - 1] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
