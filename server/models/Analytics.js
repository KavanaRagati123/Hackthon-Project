const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  activeUsers: { type: Number, default: 0 },
  totalChats: { type: Number, default: 0 },
  flaggedChats: { type: Number, default: 0 },
  avgSentiment: { type: Number, default: 0 },
  appointmentsBooked: { type: Number, default: 0 },
  appointmentsCompleted: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  commonIssues: [{ issue: String, count: Number }],
  usageByHour: { type: Map, of: Number }
}, { timestamps: true });

analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
