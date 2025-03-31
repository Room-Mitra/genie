const { registerGuest, getGuestDetails, updateGuestData, addBookingToGuest } = require('./Guest.service.js');
const express = require('express');
const router = express.Router();



// register guest
router.post('/', async (req, res) => {
    const guest = req.body;
    await registerGuest(guest);
    res.send(`${JSON.stringify(guest)} has been added to the Database`);
})
// get guest details
router.get('/:guestId', async (req, res) => {
    const guestId = req.params.guestId;
    console.log("Looking up Guest Details for id = " + guestId);
    const guestData = await getGuestDetails(guestId)
    console.log(`Guest Data :: ${JSON.stringify(guestData)}`)
    res.send(guestData)
})


// update guest data
router.put('/:guestId', async (req, res) => {
    const guestId = +req.params.guestId;
    await updateGuestData(guestId, req.body)
    res.send("Updated successfully");
})

//add booking to guest
router.put('/:guestId/:bookingId', async (req, res) => {
    const guestId = +req.params.guestId;
    const bookingId = +req.params.bookingId;
    await addBookingToGuest(guestId, bookingId)
    res.send("Updated successfully");
})

module.exports = router;