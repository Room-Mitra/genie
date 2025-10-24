import { listStaffForHotel } from '#services/Staff.service.js';

import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { hotelId } = req.query;
    const result = await listStaffForHotel(hotelId);
    res.json(result);
  } catch (err) {
    console.error('List staff error: ', err);
    res.status(500).json({ error: 'Failed to list staff' });
  }
});

export default router;
