import express from 'express';
import { loginDevice } from '#services/Device.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  const { hotelId, roomId } = req.body;

  if (!deviceId || !hotelId || !roomId) {
    return res.status(400).json({ message: 'deviceId, hotelId and roomId are required' });
  }

  try {
    const result = await loginDevice({ deviceId, hotelId, roomId });

    return res.status(200).json({
      token: result.token,
      tokenType: 'Bearer',
      expiresInSeconds: result.expiresInSeconds,
      device: {
        deviceId: result.device.deviceId,
        hotelId: result.device.hotelId,
        roomId: result.device.roomId,
      },
    });
  } catch (err) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: err.message });
    }
    console.error('login error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

export default router;
