import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyHotelCredentials } from '#services/AndroidLogin.service.js';
import { registerDevice } from '#services/Device.service.js';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.post('/', async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  const { roomNumber, password, hotelId } = req.body;
  console.info(`Trying to Loggin device`);
  console.info(`Device ID: ${deviceId}`);
  console.info(`Hotel ID: ${hotelId}`);
  console.info(`Room ID: ${roomNumber}`);

  if (!roomNumber || !password || !hotelId) {
    res.status(400).json({ message: 'roomNumber, hotelId and password are required' });
  }

  try {
    const isValidCredentials = await verifyHotelCredentials({ hotelId, password });
    if (!isValidCredentials) {
      res.status(401).json({ message: 'Invalid hotel id  or password' });
      console.info(`Login attempt for hotel with ${hotelId} with password ${password} : FAILED`);
      return;
    }

    await registerDevice({ deviceId, roomNumber, hotelId });

    // Generate JWT
    const token = jwt.sign({ deviceId, roomNumber, hotelId }, SECRET_KEY, { expiresIn: '5Years' });
    console.info(`Login successful for deviceId ${deviceId}`);
    console.info(`${roomNumber} with hotelId ${hotelId}`);
    res.json({ token });
  } catch (e) {
    console.error(`${roomNumber} -> Error while trying to login`, e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

export default router;
