import express from 'express';
import * as conversationService from '#services/Conversation.service.js';
import { conversationResponse } from '#presenters/conversation.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { hotelId, roomId, deviceId } = req.deviceData;

    const { conversationId, message, bookingId } = req.body;
    if (!message || !bookingId) {
      return res.status(400).json({ error: 'Require bookingId and message for conversations' });
    }

    const conversationData = {
      hotelId,
      roomId,
      deviceId,
      bookingId,
      conversationId,
      message,
    };

    const result = await conversationService.handleConverastion(conversationData);

    return res.status(201).json(conversationResponse(result));
  } catch (err) {
    console.error('Error adding to conversation', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }

  // const now = new Date();
  // const twentyMinsLater = new Date().setMinutes(new Date().getMinutes + 20);
  // const conversationId = ulid();

  // res.status(200).json({
  //   conversationId: ulid(),
  //   message: 'Sorry, can you please repeated that?',
  //   isConversationOpen: true,
  //   requests: [
  //     {
  //       requestId: ulid(),
  //       status: 'new',
  //       createdAt: toIsoString(now),
  //       estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
  //       department: 'Housekeeping',
  //       requestType: 'Towels',
  //       bookingId: ulid(),
  //       conversationId,
  //     },
  //   ],
  // });
});

export default router;
