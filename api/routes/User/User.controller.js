import express from 'express';
import * as UserService from './User.service.js';

const router = express.Router();

router.post('/sign-up', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }

    const user = await UserService.signUp({ name, email, password });

    return res.status(201).json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.log(err.CancellationReasons[0].Code);
    if (
      err.code === 'TransactionCanceledException' &&
      err?.CancellationReasons?.[0].Code === 'ConditionalCheckFailed'
    ) {
      // Email already taken due to our transactional guard
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('sign-up error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
