import { toIsoString } from '#common/timestamp.helper.js';
import express from 'express';
import { ulid } from 'ulid';

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
  const now = new Date();
  const twentyMinsLater = new Date().setMinutes(new Date().getMinutes + 20);
  const threeDaysLater = new Date().setDate(new Date().getDate() + 3);

  const bookingId = ulid();

  res.status(200).json({
    booking: {
      bookingId: bookingId,
      checkinTime: toIsoString(now),
      checkoutTime: toIsoString(threeDaysLater),
      guest: {
        firstName: 'Adithya',
        lastName: 'Prabhu',
      },
    },
    requests: [
      {
        requestId: ulid(),
        status: 'new',
        createdAt: toIsoString(now),
        estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
        department: 'Housekeeping',
        requestType: 'Towels',
        bookingId: bookingId,
        conversationId: ulid(),
      },
      {
        requestId: ulid(),
        status: 'acknowledgeded',
        createdAt: toIsoString(now),
        estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
        department: 'Room Service',
        requestType: 'Breakfast',
        bookingId: bookingId,
        conversationId: ulid(),
        order: {
          orderId: ulid(),
          estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
          items: [
            {
              name: 'Dosa',
              unitPrice: '15',
              quantity: 3,
              total: '45.00',
              image: {
                url: 'https://roommitra.com/room-mitra-logo.png',
              },
            },
            {
              name: 'Dosa',
              unitPrice: '15',
              quantity: 3,
              total: '45.00',
              image: {
                url: 'https://roommitra.com/room-mitra-logo.png',
              },
            },
          ],
          instruction: 'coffee without sugar',
          total: '200',
        },
      },
      {
        requestId: ulid(),
        status: 'acknowledgeded',
        createdAt: toIsoString(now),
        estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
        department: 'Housekeeping',
        requestType: 'Toiletries',
        bookingId: bookingId,
      },
    ],
  });
});

export default router;
