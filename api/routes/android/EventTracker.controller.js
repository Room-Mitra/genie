import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  res.status(200).json({ message: 'Tracked successfully', ...req.body });
});

export default router;
