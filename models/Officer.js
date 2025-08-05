const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  office: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
officerSchema.index({ office: 1, name: 1, isActive: 1 });

module.exports = mongoose.model('Officer', officerSchema); 