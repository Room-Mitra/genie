import express from 'express';
import multer from 'multer';
import { ulid } from 'ulid';
import S3 from '#clients/S3.client.js';
import { S3_ASSET_BUCKET, S3_PUBLIC_BASE_URL } from '#Constants/S3.constants.js';

const router = express.Router();

// Multer memory storage so we can stream to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const image = req.file;
    if (!image) return res.status(400).json({ error: 'image required for upload' });

    if (!image.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Only images are allowed' });
    }

    const originalName = image.originalname;
    const ext = originalName && originalName.includes('.') ? originalName.split('.').pop() : 'bin';
    const key = [hotelId, 'images', `${ulid()}.${ext}`].join('/');

    await S3.upload({
      Bucket: S3_ASSET_BUCKET,
      Key: key,
      Body: image.buffer,
      ContentType: image.mimetype,
    }).promise();

    const imageUrl = `${S3_PUBLIC_BASE_URL}/${encodeURI(key)}`;

    return res.status(201).json({ imageUrl: imageUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
