const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const path = require('path');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const getExtensionFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname);
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

module.exports = {
  uploadUrlToS3,
};


