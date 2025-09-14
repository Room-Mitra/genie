import express from 'express';
import jwt from 'jsonwebtoken';

import { verifyUserCredentials, addUserLogin } from './Login.service.js';
import {
  getHotelId,
  getUserName,
  isAuthenticatedUser,
} from '../../common/services/common.service.js';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.post('/', async (req, res) => {
  const { username, password, hotelId } = req.body;
  console.info(`${username} -> Login attempt for user ${username} with hotelId ${hotelId}`);

  if (!username || !password || !hotelId) {
    res.status(400).json({ message: 'Username, hotelId and password are required' });
  }

  try {
    const isValidUser = await verifyUserCredentials({ username, hotelId, password });
    if (!isValidUser) {
      res.status(401).json({ message: 'Invalid hotel id or username or password' });
      console.info(`Login attempt for user ${username} with hotelId ${hotelId} : FAILED`);
      return;
    }

    // Generate JWT
    const token = jwt.sign({ username, hotelId }, SECRET_KEY, { expiresIn: '240h' });
    console.info(`${username} -> Login successful for user ${username} with hotelId ${hotelId}`);
    res.json({ token });
  } catch (e) {
    console.error(`${username} -> Error while trying to login`, e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

router.post('/addUser', async (req, res) => {
  if (!isAuthenticatedUser(req)) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  // Extract hotelId and username from request
  const hotelId = getHotelId(req);
  const exisitngUserName = getUserName(req);
  const { username, password } = req.body;
  console.info(
    `${exisitngUserName} -> Attempting to add new user: ${username} for hotelId ${hotelId}`
  );

  // Validate input
  if (!username || !password || !hotelId) {
    console.error(
      `${exisitngUserName} -> Username: ${username}, hotelId ${hotelId}, password: ${password} :: all fields not present`
    );
    res.status(400).json({ message: 'Username, hotelId, and password are required' });
    return;
  }

  try {
    // Check if user already exists (example query, replace with your actual implementation)
    const userData = await addUserLogin({ password, hotelId, username });

    console.info(`Successfully added new user: ${username} for hotelId ${hotelId}`);
    res.status(201).json({ message: 'User added successfully', user: userData });
  } catch (e) {
    console.error(`${exisitngUserName} -> Error while adding new user: ${username}`, e);
    res.status(500).json({ message: 'An error occurred. Please try again.', error: e });
  }
});

export default router;
