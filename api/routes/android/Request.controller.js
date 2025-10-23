import { toIsoString } from '#common/timestamp.helper.js';
import express from 'express';
import { ulid } from 'ulid';
import * as requestService from '#services/Request.service.js';
import * as bookingService from '#services/Booking.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const now = new Date();
  const twentyMinsLater = new Date().setMinutes(new Date().getMinutes + 20);

  const { department, requestType } = req.body;

  res.status(200).json({
    requestId: ulid(),
    estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
    createdAt: toIsoString(now),
    department: department,
    requestType: requestType,
  });
});

router.get('/', async (req, res) => {
  try {
    const deviceData = req.deviceData;
    const bookingId = deviceData.bookingId || req.body.bookingId;
    const hotelId = deviceData.hotelId;

    const requests = await requestService.listRequests({ bookingId });
    const booking = await bookingService.getBookingById({ hotelId, bookingId });

    return res.status(200).json({
      booking: booking,
      requests: requests.items,
    });
  } catch (err) {
    console.error('Error querying requests', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
