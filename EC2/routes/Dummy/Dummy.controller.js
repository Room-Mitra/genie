import express from 'express';
import { sendWhatsAppTemplate } from '../../common/services/whatsapp.js';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.get('/', async (req, res) => {
  const { to, roomNumber } = req.query;

  if (!to || !roomNumber) {
    res.status(400).json({ error: 'Missing phone number or room number' });
    return;
  }

  await sendWhatsAppTemplate(to, roomNumber);
  res.json({ message: 'Notification sent' });
});

export default router;
