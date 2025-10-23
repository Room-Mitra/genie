import express from 'express';
const router = express.Router();
import { getAllDevices, updateDevices } from '#services/Device.service.js';

// load devices from DB to memory on restart
// hard refresh data to memory

// get all devices
router.get('/', (req, res) => {
  try {
    const { userName, hotelId } = req.userData;
    console.info(`${userName} -> Getting all devices for hotelId ${hotelId}`);
    res.send(getAllDevices(hotelId));
  } catch (error) {
    console.error('Error getting all devices:', error);
    res.status(500).send('Failed to retrieve devices');
  }
});

// update devices data
router.put('/', async (req, res) => {
  try {
    await updateDevices(req.body);
    res.send('Updated successfully');
  } catch (error) {
    console.error('Error updating devices:', error);
    res.status(500).send('Failed to update devices');
  }
});

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

export default router;
