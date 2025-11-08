import express from 'express';
import * as requestService from '#services/Request.service.js';
import { RequestStatus } from '#Constants/statuses.constasnts.js';

const router = express.Router();

router.get('/:statusType', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { statusType } = req.params;
    const { limit, nextToken } = req.query;

    const result = await requestService.listRequestsByStatusType({
      hotelId,
      statusType,
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
    const { requestId, toStatus } = req.body;

    if (!requestId || !toStatus) {
      return res
        .status(400)
        .json({ error: 'require requestId, fromState and toState for state transition' });
    }

    switch (toStatus) {
      case RequestStatus.IN_PROGRESS: {
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

      case RequestStatus.COMPLETED: {
        const { note } = req.body;
        const result = await requestService.completeRequest({
          requestId,
          hotelId,
          note,
          updatedByUserId: userId,
        });
        return res.status(200).json(result);
      }

      case RequestStatus.CANCELLED: {
        const { cancellationReason, note } = req.body;

        if (!cancellationReason)
          return res.status(400).json({ error: 'cancellation reason required' });

        const result = await requestService.cancelRequest({
          requestId,
          hotelId,
          cancellationReason,
          note,
          updatedByUserId: userId,
        });
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
