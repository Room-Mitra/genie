import { registerGuest, getGuestDetails, updateGuestData } from '#services/Guest.service.js';
import express from 'express';
const router = express.Router();

// register guest
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, mobile, email } = req.body ?? {};

    if (!firstName || !lastName || !mobile) {
      return res.status(400).json({ error: 'first name, last name, and mobile are required' });
    }

    const guest = await registerGuest({ firstName, lastName, mobile, email });

    return res.status(201).json({
      guest: {
        userId: guest.userId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        mobile: guest.mobile,
        createdAt: guest.createdAt,
      },
    });
  } catch (error) {
    if (
      error.code === 'TransactionCanceledException' &&
      error?.CancellationReasons?.filter((r) => r.Code === 'ConditionalCheckFailed')?.length > 0
    ) {
      // Email already taken due to our transactional guard
      return res.status(409).json({ error: 'Guest with mobile already registered' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
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

export default router;
