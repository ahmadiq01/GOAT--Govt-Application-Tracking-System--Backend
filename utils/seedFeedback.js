const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Application = require('../models/Application');
const User = require('../models/User');
const Officer = require('../models/Officer');
require('dotenv').config();

const seedFeedback = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goat-system');
    console.log('✅ Connected to MongoDB for feedback seeding');

    // Get existing applications, users, and officers
    const applications = await Application.find().limit(5);
    const users = await User.find({ role: 'user' }).limit(3);
    const officers = await Officer.find().limit(2);

    if (applications.length === 0) {
      console.log('⚠️  No applications found. Please seed applications first.');
      return;
    }

    if (users.length === 0) {
      console.log('⚠️  No users found. Please seed users first.');
      return;
    }

    if (officers.length === 0) {
      console.log('⚠️  No officers found. Please seed officers first.');
      return;
    }

    // Clear existing feedback
    await Feedback.deleteMany({});
    console.log('🗑️  Cleared existing feedback');

    // Sample feedback data
    const sampleFeedbacks = [];

    for (let i = 0; i < applications.length; i++) {
      const application = applications[i];
      const user = users[i % users.length];
      const officer = officers[i % officers.length];

      // Create officer feedback
      const officerFeedback = {
        applicationId: application._id,
        officerId: officer._id,
        userId: user._id,
        message: `Application ${application.trackingNumber} requires additional documentation. Please provide the following:
        
1. Valid ID card (front and back)
2. Address proof (utility bill or bank statement)
3. Recent photograph (passport size)

Please upload these documents within 7 days to avoid delays in processing.`,
        type: 'officer_feedback',
        status: 'sent',
        isRead: false
      };

      // Create user reply
      const userReply = {
        applicationId: application._id,
        officerId: officer._id,
        userId: user._id,
        message: `Thank you for the feedback. I have uploaded the required documents:
        
- ID card (front and back)
- Address proof (electricity bill)
- Recent photograph

Please review and let me know if anything else is needed.`,
        type: 'user_reply',
        status: 'sent',
        isRead: false
      };

      // Create officer follow-up
      const officerFollowUp = {
        applicationId: application._id,
        officerId: officer._id,
        userId: user._id,
        message: `Thank you for providing the documents. I have reviewed them and they appear to be in order. Your application is now under review and you should receive a decision within 3-5 business days.`,
        type: 'officer_feedback',
        status: 'sent',
        isRead: false
      };

      sampleFeedbacks.push(officerFeedback, userReply, officerFollowUp);
    }

    // Insert feedback with proper thread management
    for (let i = 0; i < sampleFeedbacks.length; i += 3) {
      const threadId = new mongoose.Types.ObjectId();
      
      // Officer feedback
      const officerFeedback = new Feedback({
        ...sampleFeedbacks[i],
        threadId
      });
      await officerFeedback.save();

      // User reply
      const userReply = new Feedback({
        ...sampleFeedbacks[i + 1],
        threadId,
        parentFeedbackId: officerFeedback._id
      });
      await userReply.save();

      // Officer follow-up
      const officerFollowUp = new Feedback({
        ...sampleFeedbacks[i + 2],
        threadId,
        parentFeedbackId: userReply._id
      });
      await officerFollowUp.save();

      // Update status of previous feedback
      await Feedback.findByIdAndUpdate(officerFeedback._id, { status: 'replied' });
      await Feedback.findByIdAndUpdate(userReply._id, { status: 'replied' });
    }

    console.log(`✅ Created ${sampleFeedbacks.length} feedback messages in ${Math.ceil(sampleFeedbacks.length / 3)} conversation threads`);
    console.log('📝 Feedback seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding feedback:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedFeedback();
}

module.exports = seedFeedback;
