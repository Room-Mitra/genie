import { listStaffForHotel } from '#services/Staff.service.js';
import * as hotelService from '#services/Hotel.service.js';

import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const result = await listStaffForHotel(hotelId);
    res.json(result);
  } catch (err) {
    console.error('List staff error: ', err);
    res.status(500).json({ error: 'Failed to list staff' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const {
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      department,
      role,
      reportingToUserId,
    } = req.body || {};

    if (!firstName || !lastName || !mobileNumber || !email || !password || !department || !role) {
      return res.status(400).json({
        error: 'firstName, lastName, mobileNumber, email, password, department, role are required',
      });
    }

    const staffData = {
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      department,
      role,
      reportingToUserId,
    };

    const result = await hotelService.addStaffToHotel(hotelId, staffData);
    return res.status(201).json(result);
  } catch (err) {
    console.error('addStaffToHotel error:', err);
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err.code === 'ConditionalCheckFailedException') {
      return res.status(200).json({ message: 'User already added as staff' });
    }
    return res
      .status(500)
      .json({ error: 'Failed to add staff to hotel' + (err.message ? ': ' + err.message : '') });
  }
});

export default router;
