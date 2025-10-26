import express from 'express';
import multer from 'multer';
import * as hotelService from '#services/Hotel.service.js';
import { hotelResponse } from '#presenters/hotel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const item = await hotelService.getHotelById(hotelId);
    if (!item) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotelResponse(item));
  } catch (err) {
    console.error('Get hotel error:', err);
    res.status(500).json({ error: 'Failed to get hotel' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;

    const updated = await hotelService.updateHotelById(hotelId, req.body);
    res.json(hotelResponse(updated));
  } catch (err) {
    console.error('Update hotel error:', err);
    if (err.status) return res.status(err.status).json({ error: err.message });
    if (err.code === 'ConditionalCheckFailedException') {
      return res.status(409).json({ error: 'Hotel was modified or does not exist' });
    }
    res.status(500).json({ error: 'Failed to update hotel' });
  }
});

// Multer memory storage so we can stream to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.get('/amenities', async (req, res) => {
  try {
    const { hotelId } = req.userData;

    const amenities = await hotelService.listAmenities({ hotelId });
    return res.status(200).json(amenities);
  } catch (err) {
    console.error('Error listing amenities', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

router.post('/amenities', upload.single('image'), async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { title = '', description = '' } = req.body || {};
    const image = req.file;
    if (!title || !description || !image)
      return res.status(400).json({ error: 'Require title, description and image for amenity' });

    if (!image.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Only images are allowed' });
    }

    const amenity = await hotelService.addAmenity({
      hotelId,
      title,
      description,
      image,
    });

    return res.status(201).json(amenity);
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.delete('/amenities/:amenityId', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { amenityId } = req.params;
    
    if (!amenityId) return res.status(400).json({ error: 'amenity id needed to delete' });

    await hotelService.deleteAmenity({ hotelId, amenityId });

    return res.status(200).json({ message: 'deleted amenity' });
  } catch (err) {
    console.error('failed to delete amentiy', err);
    res.status(500).json({ error: err?.message || 'internal server error ' });
  }
});

export default router;
