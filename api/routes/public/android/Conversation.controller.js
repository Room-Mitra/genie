import { toIsoString } from '#common/timestamp.helper.js';
import express from 'express';
import { ulid } from 'ulid';

const router = express.Router();

router.post('/', async (req, res) => {
  const now = new Date();
  const twentyMinsLater = new Date().setMinutes(new Date().getMinutes + 20);
  const conversationId = ulid();

  res.status(200).json({
    conversationId: ulid(),
    message: 'Sorry, can you please repeated that?',
    isConversationOpen: true,
    requests: [
      {
        requestId: ulid(),
        status: 'new',
        createdAt: toIsoString(now),
        estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
        department: 'Housekeeping',
        requestType: 'Towels',
        bookingId: ulid(),
        conversationId,
      },
    ],
  });
});

export default router;
