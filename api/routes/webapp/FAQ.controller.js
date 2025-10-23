import express from 'express';
import { registerFAQ, fetchFAQ } from '#services/FAQ.service.js';
const router = express.Router();

// register FAQ
router.post('/', async (req, res) => {
  const faq = req.body;
  // @ts-ignore
  const userData = req.userData;
  await registerFAQ(faq, userData);
  res.send(`${JSON.stringify(faq)} : has been added to the Database`);
});

router.get('/', async (req, res) => {
  // @ts-ignore
  const userData = req.userData;
  const faq = await fetchFAQ(userData['hotelId']);
  res.send(faq);
});

router.get('/:hotelId', async (req, res) => {
  let hotelId = req.params.hotelId;
  hotelId = hotelId.replace('%20', ' ');
  const faq = await fetchFAQ(hotelId);
  res.send(faq);
});

export default router;
