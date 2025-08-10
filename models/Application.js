const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cnic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    applicationTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApplicationType',
      required: true,
      index: true,
    },
    applicationTypeName: {
      type: String,
      required: true,
      trim: true,
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer',
      required: false,
      index: true,
    },
    officerName: {
      type: String,
      trim: true,
    },
    officerDesignation: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Submitted', 'Processing', 'Completed', 'Rejected'],
      default: 'Submitted',
      index: true,
    },
    acknowledgement: {
      type: String,
      default: 'Received',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ cnic: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);


