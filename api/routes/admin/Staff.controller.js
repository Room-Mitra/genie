import { listStaffForHotel } from '#services/Staff.service.js';
import * as hotelService from '#services/Hotel.service.js';

import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { hotelId, user } = req.body || {};
    if (!hotelId || !user) {
      return res.status(400).json({ error: 'hotelId and user are required' });
    }

    const result = await hotelService.addStaffToHotel(hotelId, user);
    return res.status(201).json(result);
  } catch (err) {
    console.error('addStaffToHotel error:', err);
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err.code === 'ConditionalCheckFailedException') {
      return res.status(200).json({ message: 'User already added as staff' });
    }
    return res
      .status(500)
      .json({ error: 'Failed to add staff to hotel' + (err.message ? ': ' + err.message : '') });
  }
});

router.get('/', async (req, res) => {
  try {
    const { hotelId, limit, nextToken } = req.query;
    const result = await listStaffForHotel(hotelId, { limit, nextToken });
    res.json(result);
  } catch (err) {
    console.error('List staff error: ', err);
    res.status(500).json({ error: 'Failed to list staff' });
  }
});

export default router;
