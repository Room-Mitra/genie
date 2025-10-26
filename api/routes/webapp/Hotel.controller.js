import express from 'express';
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

export default router;
