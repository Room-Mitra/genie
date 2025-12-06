import { getAvailableRooms } from '#services/Staah.service.js';
import express from 'express';

const router = express.Router();

router.get('/room-availability', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const availableRooms = await getAvailableRooms(startDate, endDate);
    return res.status(200).json(availableRooms);
  } catch (err) {
    console.error('staah room availability error', err);
    return res
      .status(500)
      .json({ error: err?.message || 'error getting room availability from staah' });
  }
});

export default router;
