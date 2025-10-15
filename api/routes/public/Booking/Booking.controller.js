import { registerBooking } from '#services/Booking.service.js';
import express from 'express';
const router = express.Router();

// register booking
router.post('/', async (req, res) => {
  const bookingData = req.body;
  await registerBooking(bookingData);
  res.send(`${JSON.stringify(bookingData)} has been added to the Database`);
});
/*
// get booking details
router.get('/:bookingId', async (req, res) => {
    const bookingId = +req.params.bookingId;
    const bookingData = await getBookingDetails(bookingId)
    res.send(bookingData)
})

// update booking data
router.put('/:bookingId', async (req, res) => {
    const bookingId = +req.params.bookingId;
    await updateBookingData(bookingId, req.body)
    res.send("Updated successfully");
})

// add intent to booking data
router.put('/:bookingId', async (req, res) => {
    const bookingId = +req.params.bookingId;
    await addIntentToBooking(req.body)
    res.send("Updated successfully");
})
*/

export default router;

// bookingId
// GuestId
// Rooms
// checkin
// checkout ?
