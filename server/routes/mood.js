const express = require('express');
const { auth } = require('../middleware/auth');
const { moodValidation } = require('../middleware/validation');
const MoodEntry = require('../models/MoodEntry');

const router = express.Router();

// Log mood entry
router.post('/', auth, moodValidation, async (req, res, next) => {
  try {
    const { moodScore, note, assessmentScores } = req.body;

    // Calculate PHQ-4 totals if assessment provided
    let assessment = undefined;
    if (assessmentScores) {
      const { anxiety1, anxiety2, depression1, depression2 } = assessmentScores;
      assessment = {
        anxiety1, anxiety2, depression1, depression2,
        totalAnxiety: (anxiety1 || 0) + (anxiety2 || 0),
        totalDepression: (depression1 || 0) + (depression2 || 0),
        totalScore: (anxiety1 || 0) + (anxiety2 || 0) + (depression1 || 0) + (depression2 || 0)
      };
    }

    const entry = new MoodEntry({
      userId: req.userId,
      moodScore,
      note,
      assessmentScores: assessment,
      date: new Date()
    });

    await entry.save();
    res.status(201).json({ entry });
  } catch (error) {
    next(error);
  }
});

// Get mood history
router.get('/history', auth, async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId: req.userId,
      date: { $gte: since }
    }).sort({ date: 1 });

    // Compute stats
    const scores = entries.map(e => e.moodScore);
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
    const trend = scores.length >= 2 ? (scores[scores.length - 1] > scores[0] ? 'improving' : scores[scores.length - 1] < scores[0] ? 'declining' : 'stable') : 'insufficient data';

    res.json({
      entries,
      stats: {
        average: parseFloat(avg),
        trend,
        totalEntries: entries.length,
        highestMood: Math.max(...scores, 0),
        lowestMood: Math.min(...scores, 5)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get today's entry
router.get('/today', auth, async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const entry = await MoodEntry.findOne({
      userId: req.userId,
      date: { $gte: start, $lte: end }
    });

    res.json({ entry, hasCheckedIn: !!entry });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
