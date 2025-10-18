import express from 'express';
import * as hotelService from '#services/Hotel.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { limit, nextToken } = req.query;
    const result = await hotelService.listHotels({ limit, nextToken });
    res.json(result);
  } catch (err) {
    console.error('List hotels error:', err);
    res.status(500).json({ error: 'Failed to list hotels' });
  }
});

router.get('/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const item = await hotelService.getHotelById(hotelId);
    if (!item) return res.status(404).json({ error: 'Hotel not found' });
    res.json(item);
  } catch (err) {
    console.error('Get hotel error:', err);
    res.status(500).json({ error: 'Failed to get hotel' });
  }
});

router.put('/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const updated = await hotelService.updateHotelById(hotelId, req.body);
    res.json({ message: 'Hotel updated', item: updated });
  } catch (err) {
    console.error('Update hotel error:', err);
    if (err.status) return res.status(err.status).json({ error: err.message });
    if (err.code === 'ConditionalCheckFailedException') {
      return res.status(409).json({ error: 'Hotel was modified or does not exist' });
    }
    res.status(500).json({ error: 'Failed to update hotel' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, address, contactEmail, contactPhone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Hotel name is required' });
    }

    const result = await hotelService.addHotel({
      name,
      address,
      contactEmail,
      contactPhone,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding hotel:', err);
    res.status(500).json({ error: 'Failed to add hotel' });
  }
});

export default router;
