const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  category: { type: String, default: 'electrical' },
  status: { type: String, enum: ['pending','in-progress','resolved','rejected'], default: 'pending' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Assignment controls
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  visibleToAll: { type: Boolean, default: false },

  // Optional extras
  images: { type: [String], default: [] },
  comments: [{
    text: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
