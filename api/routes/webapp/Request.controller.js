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

router.post('/state-transition', async (req, res) => {
  try {
    const { hotelId, sub: userId } = req.userData;

    const { requestId, toState } = req.body;

    if (!requestId || !toState) {
      return res
        .status(400)
        .json({ error: 'require requestId, fromState and toState for state transition' });
    }

    switch (toState) {
      case 'in_progress': {
        const { assignedStaffUserId, note } = req.body;
        const result = await requestService.startRequest({
          requestId,
          hotelId,
          assignedStaffUserId,
          note,
          updatedByUserId: userId,
        });
        return res.status(200).json(result);
      }

      case 'completed': {
        const { note } = req.body;
        const result = await requestService.completeRequest({ requestId, hotelId, note });
        return res.status(200).json(result);
      }

      default:
        return res.status(400).json({ error: 'Unknown toState' });
    }
  } catch (err) {
    console.error('error transitioning request state', err);
    res.status(500).json({ error: err?.message || 'Failed to transition request state' });
  }
});

export default router;
