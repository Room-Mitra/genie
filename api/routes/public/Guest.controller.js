import {
  registerGuest,
  getGuestDetails,
  updateGuestData,
  addBookingToGuest,
} from '#services/Guest.service.js';
import express from 'express';
const router = express.Router();

// register guest
router.post('/', async (req, res) => {
  const guest = req.body;
  await registerGuest(guest);
  res.send(`${JSON.stringify(guest)} : has been added to the Database`);
});
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

//add booking to guest
router.put('/:guestId/:bookingId', async (req, res) => {
  const guestId = +req.params.guestId;
  const bookingId = +req.params.bookingId;
  await addBookingToGuest(guestId, bookingId);
  res.send('Updated successfully');
});

export default router;
