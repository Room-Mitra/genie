import express from 'express';
import * as bookingService from '#services/Booking.service.js';
import * as requestService from '#services/Request.service.js';

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
    console.error('createBookingController error:', err);
    if (err.code === 'BOOKING_OVERLAP') {
      return res
        .status(409)
        .json({ error: 'Dates overlap with an existing booking for this room' });
    }
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/check-in', async (req, res) => {
  try {
    const { hotelId, sub: userId } = req.userData;

    const {
      checkInTime,
      checkOutTime,
      roomId,
      requestId,
      guest: { mobileNumber, firstName, lastName },
    } = req.body;

    // Basic payload validation
    if (!checkInTime || !checkOutTime || !roomId || !mobileNumber || !requestId) {
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

    await requestService.completeRequest({
      requestId,
      hotelId,
      assignedStaffUserId: userId,
      updatedByUserId: userId,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('createBookingController error:', err);
    if (err.code === 'BOOKING_OVERLAP') {
      return res
        .status(409)
        .json({ error: 'Dates overlap with an existing booking for this room' });
    }
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/active', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { limit, nextToken } = req.query;

    const bookings = await bookingService.listBookings({
      hotelId,
      status: 'active',
      limit,
      nextToken,
    });

    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Error querying active bookings', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/past', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { limit, nextToken } = req.query;

    const bookings = await bookingService.listBookings({
      hotelId,
      status: 'past',
      limit,
      nextToken,
    });

    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Error querying active bookings', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { limit, nextToken } = req.query;

    const bookings = await bookingService.listBookings({
      hotelId,
      status: 'upcoming',
      limit,
      nextToken,
    });

    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Error querying active bookings', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:bookingId', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { bookingId } = req.params;

    if (!bookingId) return res.status(400).json({ error: 'booking id needed to delete' });

    await bookingService.deleteBooking({ hotelId, bookingId });

    return res.status(200).json({ message: 'deleted booking' });
  } catch (err) {
    console.error('failed to delete booking', err);
    res.status(500).json({ error: err?.message || 'internal server error ' });
  }
});

export default router;
