import { registerBooking } from '#services/Booking.service.js';
import express from 'express';
const router = express.Router();

// register booking
router.post('/', async (req, res) => {
  const bookingData = req.body;
  await registerBooking(bookingData);
  res.send(`${JSON.stringify(bookingData)} has been added to the Database`);
});

export default router;
