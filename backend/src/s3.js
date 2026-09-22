const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');

const AWS_REGION = process.env.AWS_REGION || 'ap-south-2';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'perkfy-media-bucket-2026';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

let s3Client = null;

if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  try {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });
    console.log(`✅ AWS S3 Client initialized! Bucket: ${AWS_S3_BUCKET} (${AWS_REGION})`);
  } catch (err) {
    console.warn('⚠️ AWS S3 initialization error:', err.message);
  }
} else {
  console.warn('⚠️ AWS S3 credentials not configured in environment.');
}

// Multer memory storage for processing uploads in-memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max file limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed image and video formats
    const allowed = /jpeg|jpg|png|webp|gif|svg|mp4|mov|webm|pdf/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();

    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type (.${ext}). Allowed: JPG, PNG, WEBP, GIF, SVG, MP4, WEBM.`));
    }
  }
});

/**
 * Upload a file buffer directly to Amazon S3
 * @param {Buffer} buffer - File buffer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - Content type
 * @param {string} folder - Destination subfolder (e.g. 'avatars', 'vouchers', 'ads')
 * @returns {Promise<{ key: string, url: string, bucket: string, size: number }>}
 */
async function uploadToS3(buffer, originalname, mimetype, folder = 'general') {
  if (!s3Client) {
    throw new Error('AWS S3 client is not configured with credentials.');
  }

  const cleanExt = path.extname(originalname).toLowerCase() || '.jpg';
  const baseName = path.basename(originalname, cleanExt)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${folder}/${Date.now()}_${baseName}_${randomSuffix}${cleanExt}`;

  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype || 'application/octet-stream'
  });

  await s3Client.send(command);

  const publicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  return {
    key,
    url: publicUrl,
    bucket: AWS_S3_BUCKET,
    size: buffer.length
  };
}

/**
 * Delete an object from Amazon S3
 * @param {string} keyOrUrl - The S3 Key or full S3 URL
 */
async function deleteFromS3(keyOrUrl) {
  if (!s3Client || !keyOrUrl) return false;
  try {
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      const parts = keyOrUrl.split('.amazonaws.com/');
      if (parts.length > 1) {
        key = parts[1];
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key
    });
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.warn('S3 delete error:', err.message);
    return false;
  }
}

module.exports = {
  s3Client,
  upload,
  uploadToS3,
  deleteFromS3,
  AWS_S3_BUCKET,
  AWS_REGION
};
