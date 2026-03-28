const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'crisis'], default: 'neutral' },
  sentimentScore: { type: Number, min: -1, max: 1, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  flagged: { type: Boolean, default: false },
  flagReason: { type: String },
  language: { type: String, default: 'English' },
  overallSentiment: { type: String, default: 'neutral' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, { timestamps: true });

chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ flagged: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
