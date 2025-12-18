const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['staff', 'electrician', 'admin'], required: true, index: true },
  specialization: { type: String, trim: true },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },

  // Password reset fields (email-based)
  resetToken: { type: String },
  resetTokenExp: { type: Number }
}, { timestamps: true });

userSchema.index({ role: 1, email: 1 });

module.exports = mongoose.model('User', userSchema);
