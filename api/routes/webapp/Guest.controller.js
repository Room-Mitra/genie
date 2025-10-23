import { getGuestDetails, updateGuestData } from '#services/Guest.service.js';
import express from 'express';
const router = express.Router();

// get guest details
router.get('/:guestId', async (req, res) => {
  const guestId = req.params.guestId;
  const guestData = await getGuestDetails(guestId);
  res.send(guestData);
});

// update guest data
router.put('/:guestId', async (req, res) => {
  const guestId = +req.params.guestId;
  await updateGuestData(guestId, req.body);
  res.send('Updated successfully');
});

export default router;
