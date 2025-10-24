import express from 'express';
import * as requestService from '#services/Request.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;

    const { limit, nextToken, statuses } = req.query;

    const result = await requestService.listRequests({
      hotelId,
      statuses: typeof statuses == 'string' ? [statuses] : statuses,
      limit,
      nextToken,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('error retrieving requests', err);
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

export default router;
