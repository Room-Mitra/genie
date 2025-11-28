import { listStaffForHotel, resetStaffPassword, updateStaffById } from '#services/Staff.service.js';
import * as hotelService from '#services/Hotel.service.js';

import express from 'express';
import { userResponse } from '#presenters/user.js';
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
      weeklyShifts,
    } = req.body || {};

    if (
      !firstName ||
      !lastName ||
      !mobileNumber ||
      !email ||
      !password ||
      !department ||
      !role ||
      !weeklyShifts ||
      Object.keys(weeklyShifts).length == 0
    ) {
      return res.status(400).json({
        error:
          'firstName, lastName, mobileNumber, email, password, department, role, weeklyShifts are required',
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
      weeklyShifts,
    };

    const result = await hotelService.addStaffToHotel(hotelId, staffData);
    return res.status(201).json(userResponse(result));
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

router.delete('/:userId', async (req, res) => {
  try {
    const { hotelId, sub: userId } = req.userData;
    const { userId: toDeleteUserId } = req.params;

    if (userId === toDeleteUserId)
      return res.status(400).json({ error: 'user cannot delete self' });

    await hotelService.removeStaffFromHotel(hotelId, toDeleteUserId);

    return res.status(200).json({ message: 'deleted staff' });
  } catch (err) {
    console.error('delete staff user id error: ', err);
    if (err.code === 'USER_WITH_ACTIVE_REQUESTS') {
      return res.status(400).json({ error: err?.message });
    }
    return res.status(500).json({ error: err?.message ?? 'Failed to delete staff user id' });
  }
});

router.post('/password', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { userId, password } = req.body;

    await resetStaffPassword({ hotelId, staffUserId: userId, password });

    return res.status(200).json({ message: 'password reset' });
  } catch (err) {
    console.error('reset password error', err);
    return res.status(500).json({ error: err?.message ?? 'Failed to reset password' });
  }
});

router.put('/:staffUserId', async (req, res) => {
  try {
    const { staffUserId } = req.params;
    const payload = req.body;

    const updated = await updateStaffById(staffUserId, payload);
    res.json({ message: 'Staff updated', item: updated });
  } catch (err) {
    console.error('update staff error', err);
    return res.status(400).json({ error: err?.error || 'failed to update staff' });
  }
});

router.post('/duty', async (req, res) => {
  try {
    const { userId, onDuty } = req.body
    res.json({ message: 'Staff duty updated!', userId, onDuty });
  } catch (err) {
    console.error('Failed to update staff duty', err);
    return res.status(400).json({ error: err?.error || 'Failed to update staff duty' });
  }
})

router.post('/register-device', async (req, res) => {
  try {
    const { user, deviceId, platform, appVersion } = req.body
    console.log(({ message: `Staff device updated! ${JSON.stringify(req.body)}` }))
    res.json({ message: `Staff device updated!`, user, deviceId, platform, appVersion });
  } catch (err) {
    console.error('Failed to update staff device', err);
    return res.status(400).json({ error: err?.error || 'Failed to update staff device' });
  }
})

export default router;
