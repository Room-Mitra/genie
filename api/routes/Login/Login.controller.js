import express from 'express';
import { login } from '../Login/Login.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await login({ email, password });

    return res.status(200).json({
      token: result.token,
      tokenType: 'Bearer',
      expiresInSeconds: result.expiresInSeconds,
      user: {
        userId: result.user.userId,
        name: result.user.name,
        email: result.user.email,
        createdAt: result.user.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: err.message });
    }
    console.error('login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
