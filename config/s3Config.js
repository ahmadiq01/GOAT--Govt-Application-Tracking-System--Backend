// config/s3Config.js
const AWS = require('aws-sdk');

// Configure AWS SDK with proper error handling
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4', // Recommended for better compatibility
  s3ForcePathStyle: false, // Use virtual hosted-style URLs
  // Add timeout configurations
  httpOptions: {
    timeout: 120000, // 2 minutes timeout
    connectTimeout: 60000 // 1 minute connection timeout
  }
});

// Validate configuration on startup
const validateS3Config = () => {
  const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('S3 Configuration validated successfully');
};

// Test S3 connection
const testS3Connection = async () => {
  try {
    await s3.headBucket({ Bucket: process.env.S3_BUCKET_NAME }).promise();
    console.log('S3 bucket connection successful');
    return true;
  } catch (error) {
    console.error('S3 bucket connection failed:', error.message);
    return false;
  }
};

module.exports = { s3, validateS3Config, testS3Connection };
