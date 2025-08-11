// models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
fileSchema.index({ uploadDate: -1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ isActive: 1 });

module.exports = mongoose.model('File', fileSchema);