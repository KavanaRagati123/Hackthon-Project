const mongoose = require('mongoose');

const counsellorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, maxlength: 1000 },
  specialties: [{ type: String }],
  languages: [{ type: String }],
  workingHours: {
    monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
    sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } }
  },
  holidays: [{ type: Date }],
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 }
}, { timestamps: true });

counsellorSchema.index({ isActive: 1 });

module.exports = mongoose.model('Counsellor', counsellorSchema);
