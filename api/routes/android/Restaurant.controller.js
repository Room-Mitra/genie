import { toIsoString } from '#common/timestamp.helper.js';
import { queryMenuByHotel } from '#repositories/Menu.repository.js';
import express from 'express';
import { ulid } from 'ulid';

const router = express.Router();

router.get('/menu', async (req, res) => {
  const menu = await queryMenuByHotel({});

  res.status(200).json(menu);
});

router.post('/order', async (req, res) => {
  const now = new Date();
  const twentyMinsLater = new Date().setMinutes(new Date().getMinutes + 20);
  const bookingId = ulid();

  res.status(200).json({
    requestId: ulid(),
    status: 'acknowledgeded',
    createdAt: toIsoString(now),
    estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
    department: 'Room Service',
    requestType: 'Breakfast',
    bookingId: bookingId,
    order: {
      orderId: ulid(),
      estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
      items: [
        {
          itemId: ulid(),
          name: 'Dosa',
          unitPrice: '15',
          quantity: 3,
          total: '45.00',
          image: {
            url: 'https://roommitra.com/room-mitra-logo.png',
          },
        },
        {
          itemId: ulid(),
          name: 'Idly',
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
  });
});

export default router;
