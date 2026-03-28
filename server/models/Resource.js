const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['article', 'video', 'audio', 'pdf'], required: true },
  content: { type: String },
  language: { type: String, default: 'English' },
  category: { type: String, enum: ['Anxiety', 'Depression', 'Stress', 'Relationships', 'Academic', 'General'], required: true },
  tags: [{ type: String }],
  url: { type: String },
  thumbnail: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

resourceSchema.index({ category: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
