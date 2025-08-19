const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  
  // Officer who provided the feedback
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer',
    required: true,
    index: true
  },
  
  // User who received the feedback
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Feedback content
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // File attachment URL (optional)
  attachmentUrl: {
    type: String,
    trim: true
  },
  
  // File metadata
  attachment: {
    originalName: String,
    fileName: String,
    mimeType: String,
    size: Number,
    fileUrl: String
  },
  
  // Feedback type
  type: {
    type: String,
    enum: ['officer_feedback', 'user_reply'],
    default: 'officer_feedback',
    index: true
  },
  
  // Status of the feedback
  status: {
    type: String,
    enum: ['sent', 'read', 'replied'],
    default: 'sent',
    index: true
  },
  
  // Parent feedback ID (for replies)
  parentFeedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
    default: null
  },
  
  // Thread ID to group related feedback
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now
  },
  
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ applicationId: 1, createdAt: -1 });
feedbackSchema.index({ officerId: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ threadId: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });

// Virtual for getting the conversation thread
feedbackSchema.virtual('replies', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'parentFeedbackId'
});

// Ensure virtual fields are serialized
feedbackSchema.set('toJSON', { virtuals: true });
feedbackSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
