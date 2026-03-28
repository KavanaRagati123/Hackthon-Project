const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moodScore: { type: Number, required: true, min: 1, max: 5 },
  note: { type: String, maxlength: 500 },
  assessmentScores: {
    anxiety1: { type: Number, min: 0, max: 3 },
    anxiety2: { type: Number, min: 0, max: 3 },
    depression1: { type: Number, min: 0, max: 3 },
    depression2: { type: Number, min: 0, max: 3 },
    totalAnxiety: { type: Number },
    totalDepression: { type: Number },
    totalScore: { type: Number }
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

moodEntrySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
