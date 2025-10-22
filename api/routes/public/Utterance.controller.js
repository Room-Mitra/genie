import express from 'express';
import { onUtterance } from '#services/Utterance.service.js';

const router = express.Router();
router.post('/', async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const hotelId = req.headers['x-hotel-id'];
    const { userQuery, sessionId } = req.body;
    const { speech, isSessionOpen, agents } = await onUtterance(userQuery, hotelId, deviceId, sessionId);
    res.send({ speech, isSessionOpen, agents });
  } catch (error) {
    console.error('Error processing utterance:', error);
    res.status(500).send('Failed to process utterance');
  }
});

export default router;
