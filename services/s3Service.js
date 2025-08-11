const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const s3 = require('../config/s3Config');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
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

// Upload a remote file (by URL) to S3; returns the public S3 URL
const uploadUrlToS3 = async ({ sourceUrl, bucket, keyPrefix }) => {
  if (!bucket) throw new Error('S3 bucket is required');
  if (!sourceUrl) throw new Error('Source URL is required');

  const response = await axios.get(sourceUrl, { responseType: 'arraybuffer' });
  const body = Buffer.from(response.data);
  const contentType = response.headers['content-type'] || 'application/octet-stream';
  const extension = getExtensionFromUrl(sourceUrl);
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const key = `${keyPrefix || 'attachments'}/${uniqueSuffix}${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return publicUrl;
};

// Upload a single file to S3
const uploadFile = async (file) => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `uploads/${uuidv4()}${fileExtension}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' // Make files publicly accessible
    };

    const result = await s3.upload(uploadParams).promise();
    
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Upload multiple files to S3
const uploadMultipleFiles = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple S3 Upload Error:', error);
    throw new Error('Failed to upload one or more files to S3');
  }
};

// Delete a file from S3
const deleteFile = async (key) => {
  try {
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(deleteParams).promise();
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

module.exports = {
  uploadUrlToS3,
  uploadFile,
  uploadMultipleFiles,
  deleteFile
};
