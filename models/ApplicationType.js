const mongoose = require('mongoose');

const applicationTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
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
applicationTypeSchema.index({ name: 1, isActive: 1 });

module.exports = mongoose.model('ApplicationType', applicationTypeSchema); 