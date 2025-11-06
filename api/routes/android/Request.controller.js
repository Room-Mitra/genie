import express from 'express';
import * as requestService from '#services/Request.service.js';
import * as bookingService from '#services/Booking.service.js';
import { requestResponse } from '#presenters/request.js';
import { updateLastSeen } from '#services/Device.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { hotelId, roomId, deviceId } = req.deviceData;
    const guestUserId = req.headers['x-guest-user-id'];

    const { department, requestType, details, bookingId } = req.body;
    if (!department || !requestType) {
      // bookingId cant be sent for CTA button in NoActiveBookingScreen
      return res
        .status(400)
        .json({ error: 'Require department and requestType to create a new request' });
    }

    const requestData = {
      hotelId,
      roomId,
      deviceId,
      bookingId,
      guestUserId,
      department,
      requestType,
      details,
    };

    const result = await requestService.createRequest(requestData);

    return res.status(201).json(requestResponse(result));
  } catch (err) {
    console.error('Error creating request', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { hotelId, roomId, deviceId } = req.deviceData;

    await updateLastSeen({ hotelId, deviceId });

    let requests = {};
    const booking = await bookingService.getActiveBookingForRoom({ roomId });
    if (booking)
      requests = await requestService.listRequestsByBooking({ bookingId: booking.bookingId });

    return res.status(200).json({
      booking: booking,
      requests: requests?.items?.map(requestResponse) || [],
    });
  } catch (err) {
    console.error('Error querying requests', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

export default router;
