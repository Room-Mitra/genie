import express from 'express';
import * as orderService from '#services/Order.service.js';

const router = express.Router();

router.get('/:statusType', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { statusType } = req.params;
    const { limit, nextToken } = req.query;

    const orders = await orderService.listOrdersByStatusType({
      hotelId,
      statusType,
      limit,
      nextToken,
    });

    return res.status(200).json(orders);
  } catch (err) {
    console.error('Error querying active bookings', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
