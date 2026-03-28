const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const ChatSession = require('../models/ChatSession');
const Appointment = require('../models/Appointment');
const Post = require('../models/Post');
const MoodEntry = require('../models/MoodEntry');
const Counsellor = require('../models/Counsellor');
const Resource = require('../models/Resource');

const router = express.Router();

// Dashboard stats
router.get('/dashboard', auth, authorize('admin'), async (req, res, next) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, activeUsers24h, totalChats, flaggedChats,
      appointmentsTotal, appointmentsCompleted, totalPosts,
      totalResources, totalCounsellors
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: last24h } }),
      ChatSession.countDocuments(),
      ChatSession.countDocuments({ flagged: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'completed' }),
      Post.countDocuments(),
      Resource.countDocuments(),
      Counsellor.countDocuments({ isActive: true })
    ]);

    // Average sentiment from recent chats
    const recentChats = await ChatSession.find({ createdAt: { $gte: last7d } })
      .select('overallSentiment');
    const sentimentMap = { positive: 1, neutral: 0, negative: -0.5, crisis: -1 };
    const avgSentiment = recentChats.length ?
      (recentChats.reduce((sum, c) => sum + (sentimentMap[c.overallSentiment] || 0), 0) / recentChats.length).toFixed(2) : 0;

    // New users trend
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: last7d } });
    const newUsersLastMonth = await User.countDocuments({ createdAt: { $gte: last30d } });

    // Mood trend
    const recentMoods = await MoodEntry.find({ date: { $gte: last7d } }).select('moodScore');
    const avgMood = recentMoods.length ?
      (recentMoods.reduce((sum, m) => sum + m.moodScore, 0) / recentMoods.length).toFixed(1) : 0;

    res.json({
      stats: {
        totalUsers,
        activeUsers24h,
        totalChats,
        flaggedChats,
        appointmentsTotal,
        appointmentsCompleted,
        totalPosts,
        totalResources,
        totalCounsellors,
        avgSentiment: parseFloat(avgSentiment),
        avgMood: parseFloat(avgMood),
        newUsersThisWeek,
        newUsersLastMonth
      }
    });
  } catch (error) {
    next(error);
  }
});

// Analytics - usage over time
router.get('/analytics', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    // Daily chat counts
    const chatsByDay = await ChatSession.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Daily mood averages
    const moodsByDay = await MoodEntry.aggregate([
      { $match: { date: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, avgMood: { $avg: '$moodScore' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Post categories distribution
    const postCategories = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Popular resources
    const popularResources = await Resource.find()
      .sort({ views: -1 })
      .limit(10)
      .select('title category views likes');

    // User registrations over time
    const registrations = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      chatsByDay,
      moodsByDay,
      postCategories,
      popularResources,
      registrations
    });
  } catch (error) {
    next(error);
  }
});

// Manage counsellors
router.post('/counsellors', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { userId, bio, specialties, languages, workingHours } = req.body;
    
    // Update user role to counsellor
    await User.findByIdAndUpdate(userId, { role: 'counsellor' });

    const counsellor = new Counsellor({
      userId, bio, specialties, languages,
      workingHours: workingHours || {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '09:00', end: '13:00', isWorking: false },
        sunday: { start: '09:00', end: '13:00', isWorking: false }
      }
    });
    await counsellor.save();

    res.status(201).json({ counsellor });
  } catch (error) {
    next(error);
  }
});

// Get all users (admin)
router.get('/users', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    let filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password -otp -refreshToken');

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// Get flagged chats
router.get('/flagged-chats', auth, authorize('admin'), async (req, res, next) => {
  try {
    const chats = await ChatSession.find({ flagged: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name email anonymousId');
    res.json({ chats });
  } catch (error) {
    next(error);
  }
});

// Export data as CSV
router.get('/export/:type', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    let data = [];
    let headers = '';

    const filter = {};
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };

    switch (type) {
      case 'users':
        headers = 'Name,Email,Role,College,Year,Registered\n';
        const users = await User.find(filter).select('name email role college year createdAt');
        data = users.map(u => `${u.name},${u.email},${u.role},${u.college || ''},${u.year || ''},${u.createdAt}`);
        break;
      case 'appointments':
        headers = 'Date,Status,Duration,Anonymous\n';
        const apts = await Appointment.find(filter).select('dateTime status duration isAnonymous');
        data = apts.map(a => `${a.dateTime},${a.status},${a.duration},${a.isAnonymous}`);
        break;
      case 'moods':
        headers = 'Date,Score,Note\n';
        const moods = await MoodEntry.find(filter).select('date moodScore note');
        data = moods.map(m => `${m.date},${m.moodScore},"${(m.note || '').replace(/"/g, '""')}"`);
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    const csv = headers + data.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mindmate-${type}-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
