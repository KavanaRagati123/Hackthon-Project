const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counsellor', required: true },
  dateTime: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  meetingLink: { type: String },
  notes: { type: String },
  counsellorNotes: [{
    text: { type: String, required: true },
    type: { type: String, enum: ['suggestion', 'follow-up', 'resource', 'general'], default: 'general' },
    createdAt: { type: Date, default: Date.now }
  }],
  isAnonymous: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ studentId: 1 });
appointmentSchema.index({ counsellorId: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
