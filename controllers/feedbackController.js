const Feedback = require('../models/Feedback');
const Application = require('../models/Application');
const User = require('../models/User');
const Officer = require('../models/Officer');
const { successResponse, errorResponse, asyncHandler } = require('../utils/responseHandler');
const mongoose = require('mongoose');

// POST /api/feedback - Officer creates feedback for user
const createFeedback = asyncHandler(async (req, res) => {
  const { 
    applicationId, 
    userId, 
    message, 
    attachmentUrl,
    attachment 
  } = req.body;
  
  const { _id: officerId, role } = req.user;

  // Validate required fields
  if (!applicationId || !userId || !message) {
    return errorResponse(res, 'Missing required fields: applicationId, userId, message', 400);
  }

  // Check if user is an officer or admin
  if (role !== 'officer' && role !== 'admin' && role !== 'superadmin') {
    return errorResponse(res, 'Access denied. Only officers can create feedback.', 403);
  }

  // Verify application exists and officer is assigned to it
  const application = await Application.findById(applicationId);
  if (!application) {
    return errorResponse(res, 'Application not found', 404);
  }

  // Check if officer is assigned to this application
  if (application.officerId && application.officerId.toString() !== officerId.toString()) {
    return errorResponse(res, 'Access denied. You can only provide feedback for applications assigned to you.', 403);
  }

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Create thread ID (first feedback in a conversation)
  const threadId = new mongoose.Types.ObjectId();

  // Create feedback
  const feedback = new Feedback({
    applicationId,
    officerId,
    userId,
    message,
    attachmentUrl,
    attachment,
    type: 'officer_feedback',
    threadId,
    status: 'sent'
  });

  await feedback.save();

  // Populate references for response
  await feedback.populate([
    { path: 'applicationId', select: 'trackingNumber name' },
    { path: 'officerId', select: 'name designation department' },
    { path: 'userId', select: 'name email' }
  ]);

  return successResponse(res, {
    message: 'Feedback sent successfully',
    feedback: {
      _id: feedback._id,
      applicationId: feedback.applicationId,
      officerId: feedback.officerId,
      userId: feedback.userId,
      message: feedback.message,
      attachment: feedback.attachment,
      type: feedback.type,
      threadId: feedback.threadId,
      status: feedback.status,
      sentAt: feedback.sentAt,
      createdAt: feedback.createdAt
    }
  }, 201);
});

// POST /api/feedback/:feedbackId/reply - User replies to officer feedback
const replyToFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { message, attachmentUrl, attachment } = req.body;
  const { _id: userId, role } = req.user;

  // Validate required fields
  if (!message) {
    return errorResponse(res, 'Message is required', 400);
  }

  // Check if user is a regular user
  if (role !== 'user') {
    return errorResponse(res, 'Access denied. Only users can reply to feedback.', 403);
  }

  // Find the original feedback
  const originalFeedback = await Feedback.findById(feedbackId)
    .populate('applicationId', 'trackingNumber name')
    .populate('officerId', 'name designation department');

  if (!originalFeedback) {
    return errorResponse(res, 'Feedback not found', 404);
  }

  // Check if user is the intended recipient
  if (originalFeedback.userId.toString() !== userId.toString()) {
    return errorResponse(res, 'Access denied. You can only reply to feedback intended for you.', 403);
  }

  // Create reply
  const reply = new Feedback({
    applicationId: originalFeedback.applicationId._id,
    officerId: originalFeedback.officerId._id,
    userId,
    message,
    attachmentUrl,
    attachment,
    type: 'user_reply',
    parentFeedbackId: feedbackId,
    threadId: originalFeedback.threadId,
    status: 'sent'
  });

  await reply.save();

  // Update original feedback status to 'replied'
  await Feedback.findByIdAndUpdate(feedbackId, { 
    status: 'replied',
    updatedAt: new Date()
  });

  // Populate references for response
  await reply.populate([
    { path: 'applicationId', select: 'trackingNumber name' },
    { path: 'officerId', select: 'name designation department' },
    { path: 'userId', select: 'name email' }
  ]);

  return successResponse(res, {
    message: 'Reply sent successfully',
    reply: {
      _id: reply._id,
      applicationId: reply.applicationId,
      officerId: reply.officerId,
      userId: reply.userId,
      message: reply.message,
      attachment: reply.attachment,
      type: reply.type,
      parentFeedbackId: reply.parentFeedbackId,
      threadId: reply.threadId,
      status: reply.status,
      sentAt: reply.sentAt,
      createdAt: reply.createdAt
    }
  }, 201);
});

// GET /api/feedback/application/:applicationId - Get all feedback for a specific application
const getApplicationFeedback = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { _id: userId, role } = req.user;

  // Verify application exists
  const application = await Application.findById(applicationId);
  if (!application) {
    return errorResponse(res, 'Application not found', 404);
  }

  // Check access permissions
  let canAccess = false;
  
  if (role === 'user') {
    // Users can only see feedback for their own applications
    canAccess = application.cnic === req.user.nic;
  } else if (role === 'officer' || role === 'admin' || role === 'superadmin') {
    // Officers can see feedback for applications assigned to them
    canAccess = !application.officerId || application.officerId.toString() === userId.toString();
  }

  if (!canAccess) {
    return errorResponse(res, 'Access denied. You can only view feedback for applications you have access to.', 403);
  }

  // Get all feedback for this application, grouped by thread
  const feedbackThreads = await Feedback.aggregate([
    { $match: { applicationId: new mongoose.Types.ObjectId(applicationId) } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: '$threadId',
        feedbacks: { $push: '$$ROOT' },
        latestMessage: { $last: '$$ROOT' }
      }
    },
    { $sort: { 'latestMessage.createdAt': -1 } }
  ]);

  // Populate references for each feedback
  const populatedThreads = await Promise.all(
    feedbackThreads.map(async (thread) => {
      const populatedFeedbacks = await Feedback.populate(thread.feedbacks, [
        { path: 'officerId', select: 'name designation department' },
        { path: 'userId', select: 'name email' }
      ]);
      
      return {
        threadId: thread._id,
        feedbacks: populatedFeedbacks,
        totalMessages: thread.feedbacks.length,
        latestMessage: thread.latestMessage
      };
    })
  );

  return successResponse(res, {
    application: {
      _id: application._id,
      trackingNumber: application.trackingNumber,
      name: application.name
    },
    feedbackThreads: populatedThreads
  });
});

// GET /api/feedback/user - Get all feedback for the authenticated user
const getUserFeedback = asyncHandler(async (req, res) => {
  const { _id: userId, role } = req.user;

  if (role !== 'user') {
    return errorResponse(res, 'Access denied. This endpoint is for regular users only.', 403);
  }

  const { page = 1, limit = 20, status } = req.query;

  // Build filter
  const filter = { userId };
  if (status) filter.status = status;

  // Get feedback with pagination
  const feedbacks = await Feedback.find(filter)
    .populate('applicationId', 'trackingNumber name status')
    .populate('officerId', 'name designation department')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count
  const total = await Feedback.countDocuments(filter);

  // Get unread count
  const unreadCount = await Feedback.countDocuments({ 
    userId, 
    isRead: false,
    type: 'officer_feedback'
  });

  return successResponse(res, {
    feedbacks,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalFeedbacks: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    unreadCount
  });
});

// GET /api/feedback/officer - Get all feedback for the authenticated officer
const getOfficerFeedback = asyncHandler(async (req, res) => {
  const { _id: officerId, role } = req.user;

  if (role !== 'officer' && role !== 'admin' && role !== 'superadmin') {
    return errorResponse(res, 'Access denied. This endpoint is for officers only.', 403);
  }

  const { page = 1, limit = 20, status, applicationId } = req.query;

  // Build filter
  const filter = { officerId };
  if (status) filter.status = status;
  if (applicationId) filter.applicationId = applicationId;

  // Get feedback with pagination
  const feedbacks = await Feedback.find(filter)
    .populate('applicationId', 'trackingNumber name status')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count
  const total = await Feedback.countDocuments(filter);

  // Get pending replies count
  const pendingRepliesCount = await Feedback.countDocuments({ 
    officerId, 
    type: 'user_reply',
    isRead: false
  });

  return successResponse(res, {
    feedbacks,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalFeedbacks: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    pendingRepliesCount
  });
});

// PUT /api/feedback/:feedbackId/read - Mark feedback as read
const markFeedbackAsRead = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { _id: userId, role } = req.user;

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    return errorResponse(res, 'Feedback not found', 404);
  }

  // Check if user has permission to mark this feedback as read
  let canMarkAsRead = false;
  
  if (role === 'user') {
    canMarkAsRead = feedback.userId.toString() === userId.toString();
  } else if (role === 'officer' || role === 'admin' || role === 'superadmin') {
    canMarkAsRead = feedback.officerId.toString() === userId.toString();
  }

  if (!canMarkAsRead) {
    return errorResponse(res, 'Access denied. You can only mark your own feedback as read.', 403);
  }

  // Update read status
  await Feedback.findByIdAndUpdate(feedbackId, {
    isRead: true,
    readAt: new Date()
  });

  return successResponse(res, {
    message: 'Feedback marked as read successfully'
  });
});

// DELETE /api/feedback/:feedbackId - Delete feedback (only by creator)
const deleteFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;
  const { _id: userId, role } = req.user;

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    return errorResponse(res, 'Feedback not found', 404);
  }

  // Check if user can delete this feedback
  let canDelete = false;
  
  if (role === 'user') {
    canDelete = feedback.userId.toString() === userId.toString() && feedback.type === 'user_reply';
  } else if (role === 'officer' || role === 'admin' || role === 'superadmin') {
    canDelete = feedback.officerId.toString() === userId.toString() && feedback.type === 'officer_feedback';
  }

  if (!canDelete) {
    return errorResponse(res, 'Access denied. You can only delete your own feedback.', 403);
  }

  // Check if feedback has replies
  const hasReplies = await Feedback.exists({ parentFeedbackId: feedbackId });
  if (hasReplies) {
    return errorResponse(res, 'Cannot delete feedback that has replies.', 400);
  }

  await Feedback.findByIdAndDelete(feedbackId);

  return successResponse(res, {
    message: 'Feedback deleted successfully'
  });
});

module.exports = {
  createFeedback,
  replyToFeedback,
  getApplicationFeedback,
  getUserFeedback,
  getOfficerFeedback,
  markFeedbackAsRead,
  deleteFeedback
};
