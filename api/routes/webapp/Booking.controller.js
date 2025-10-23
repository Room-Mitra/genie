import express from 'express';
import * as bookingService from '#services/Booking.service.js';

const router = express.Router();

// register booking
router.post('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;

    const {
      checkInTime,
      checkOutTime,
      roomId,
      guest: { mobileNumber, firstName, lastName },
    } = req.body;

    // Basic payload validation
    if (!checkInTime || !checkOutTime || !roomId || !mobileNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingData = {
      hotelId,
      checkInTime,
      checkOutTime,
      roomId,
      guest: {
        mobileNumber,
        firstName,
        lastName,
      },
    };

    const result = await bookingService.createBooking(bookingData);

    return res.status(201).json(result);
  } catch (err) {
    if (err.code === 'BOOKING_OVERLAP') {
      return res.status(409).json({ error: 'Dates overlap with an existing booking' });
    }
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: err.message });
    }
    console.error('createBookingController error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
