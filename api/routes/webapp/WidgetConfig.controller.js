import express from 'express';
import { getWebVoiceAgentWidgetSignatures } from '#services/Widget.service.js';

const router = express.Router();

router.get('/web-voice-agent/signatures', async (req, res) => {
  try {
    const { hotelId } = req.userData;

    const signatures = await getWebVoiceAgentWidgetSignatures({ hotelId });

    res.status(200).json({ signatures });
  } catch (err) {
    console.error('error fetching web voice agent signatures', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

export default router;
