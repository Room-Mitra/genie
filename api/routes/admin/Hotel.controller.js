import express from 'express';
import * as hotelService from '#services/hotel.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, address, city, country, contactEmail, contactPhone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Hotel name is required' });
    }

    const result = await hotelService.addHotel({
      name,
      address,
      city,
      country,
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
