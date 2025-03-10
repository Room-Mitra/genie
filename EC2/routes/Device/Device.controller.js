const express = require('express');
const router = express.Router();
const { registerDevice, getAllDevices, updatedDevices } = require('./Device.service.js');

// register device
router.post('/', async (req, res) => {
    const device = req.body;
    await registerDevice(device);
    res.send(`${JSON.stringify(device)} has been added to the Database`);
})


// load devices from DB to memory on restart
// hard refresh data to memory

// get all devices
router.get('/', (req, res) => {
    res.send(getAllDevices());
})

// update devices data
router.put('/', async (req, res) => {
    await updatedDevices(req.body)
    res.send("Updated successfully");
})


// get device details by id
// get device details by room number
// find devices in room
// find devices in property
// find devices in floor
// find devices by roomType/room tags
// find devices by tag
// get room details by room number
// edit device by id/room number
// delete device by id/room number

module.exports = router;