// services/s3Service.js - Using Presigned URLs (This will work!)
const AWS = require('aws-sdk');
const axios = require('axios');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4'
});

// Helper function to get file extension from URL
const getExtensionFromUrl = (url) => {
  try {
    const ext = path.extname(url);
    return ext || '';
  } catch (e) {
    return '';
  }
};

// Generate presigned URL for file access
const generatePresignedUrl = async (key, expiresIn = 86400) => { // 24 hours default
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

// Upload a remote file (by URL) to S3
const uploadUrlToS3 = async ({ sourceUrl, bucket, keyPrefix }) => {
  if (!bucket) throw new Error('S3 bucket is required');
  if (!sourceUrl) throw new Error('Source URL is required');

  try {
    const response = await axios.get(sourceUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const body = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const extension = getExtensionFromUrl(sourceUrl);
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const key = `${keyPrefix || 'attachments'}/${uniqueSuffix}${extension}`;

    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    };

    const result = await s3.upload(uploadParams).promise();
    
    // Generate presigned URL for access
    const presignedUrl = await generatePresignedUrl(key, 86400); // 24 hours
    
    return presignedUrl;
  } catch (error) {
    console.error('URL upload error:', error);
    throw new Error(`Failed to upload URL to S3: ${error.message}`);
  }
};

// Upload a single file to S3 - Returns actual S3 URL (not presigned)
const uploadFile = async (file, folderPath = 'uploads') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (!file.buffer) {
      throw new Error('File buffer is empty');
    }

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME environment variable is not set');
    }

    if (!process.env.AWS_REGION) {
      throw new Error('AWS_REGION environment variable is not set');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${folderPath}/${uuidv4()}${fileExtension}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'original-name': file.originalname,
        'upload-date': new Date().toISOString()
      }
    };

    console.log('Attempting to upload file:', {
      bucket: process.env.S3_BUCKET_NAME,
      key: fileName,
      size: file.buffer.length,
      contentType: file.mimetype,
      region: process.env.AWS_REGION
    });

    const result = await s3.upload(uploadParams).promise();
    
    // Return the actual S3 URL (not presigned)
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    console.log('File uploaded successfully. S3 URL generated:', s3Url);
    
    return s3Url;
  } catch (error) {
    console.error('S3 Upload Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable
    });
    
    if (error.code === 'NoSuchBucket') {
      throw new Error('S3 bucket does not exist or is not accessible');
    } else if (error.code === 'InvalidAccessKeyId') {
      throw new Error('Invalid AWS access key ID');
    } else if (error.code === 'SignatureDoesNotMatch') {
      throw new Error('Invalid AWS secret access key');
    } else if (error.code === 'AccessDenied') {
      throw new Error('Access denied to S3 bucket');
    } else {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }
};

// Upload multiple files to S3
const uploadMultipleFiles = async (files) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    console.log(`Starting upload of ${files.length} files`);
    
    const uploadPromises = files.map((file, index) => 
      uploadFile(file).catch(error => {
        console.error(`Failed to upload file ${index + 1}:`, error.message);
        throw error;
      })
    );
    
    const results = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${results.length} files`);
    
    return results;
  } catch (error) {
    console.error('Multiple S3 Upload Error:', error);
    throw new Error(`Failed to upload one or more files to S3: ${error.message}`);
  }
};

// Delete a file from S3
const deleteFile = async (key) => {
  try {
    if (!key) {
      throw new Error('File key is required for deletion');
    }

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME environment variable is not set');
    }

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    console.log('Attempting to delete file:', deleteParams);
    
    await s3.deleteObject(deleteParams).promise();
    
    console.log('File deleted successfully from S3:', key);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

// Get a fresh presigned URL for an existing file
const getFileUrl = async (key, expiresIn = 3600) => {
  try {
    if (!key) {
      throw new Error('File key is required');
    }

    const presignedUrl = await generatePresignedUrl(key, expiresIn);
    return presignedUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw new Error(`Failed to generate file URL: ${error.message}`);
  }
};

// Test S3 connection
const testS3Connection = async () => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    
    if (!bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is not set');
    }
    
    if (!region) {
      throw new Error('AWS_REGION environment variable is not set');
    }

    // Test bucket access
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log('✅ S3 bucket connection successful');

    // Test upload permissions
    const testKey = 'test/connection-test.txt';
    const testParams = {
      Bucket: bucketName,
      Key: testKey,
      Body: 'Connection test file',
      ContentType: 'text/plain'
    };

    await s3.upload(testParams).promise();
    console.log('✅ S3 upload permissions verified');

    // Test presigned URL generation
    const testPresignedUrl = await generatePresignedUrl(testKey, 300); // 5 minutes
    console.log('✅ Presigned URL generated:', testPresignedUrl);

    // Clean up test file
    await s3.deleteObject({ Bucket: bucketName, Key: testKey }).promise();
    console.log('✅ S3 delete permissions verified');

    return true;
  } catch (error) {
    console.error('❌ S3 connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  uploadUrlToS3,
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileUrl,
  testS3Connection
};