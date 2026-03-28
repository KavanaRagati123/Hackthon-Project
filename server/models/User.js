const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'counsellor', 'admin'], default: 'student' },
  college: { type: String, trim: true },
  year: { type: Number, min: 1, max: 6 },
  phone: { type: String },
  language: { type: String, default: 'English' },
  isAnonymousMode: { type: Boolean, default: false },
  anonymousId: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  refreshToken: { type: String },
  avatar: { type: String },
  onboardingComplete: { type: Boolean, default: false },
  consentAnonymousData: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ lastActive: -1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.anonymousId) {
    this.anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
