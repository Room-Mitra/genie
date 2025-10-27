import express from 'express';
import * as conversationService from '#services/Conversation.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { hotelId, roomId, deviceId, bookingId } = req.deviceData;

    const { conversationId, message } = req.body;
    if (!message || !bookingId) {
      return res.status(400).json({ error: 'Require bookingId and message for conversations' });
    }

    const conversationData = {
      hotelId,
      roomId,
      deviceId,
      bookingId,
      conversationId,
      userContent: message,
    };

    const result = await conversationService.handleConversation(conversationData);

    return res.status(201).json(result);
  } catch (err) {
    console.error('Error adding to conversation', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

export default router;
