import express from 'express';
import admin from 'firebase-admin';
import serviceAccount from '../../config/roommitra-staff-notifications-firebase-adminsdk-fbsvc-fe5a9df8bd.json' assert { type: 'json' };

const router = express.Router();

const tokensByStaff = new Map();
router.post('/save-token', async (req, res) => {
  try {
    const { staffId, token } = req.body;

    const set = tokensByStaff.get(staffId) || new Set();
    set.add(token);
    tokensByStaff.set(staffId, set);

    setTimeout(() => {
      sendToToken(token, 'Test notification', 'This is a test notification');
    }, 5000)

    return res.status(200).json(tokensByStaff);
  } catch (err) {
    console.error('Error querying active bookings', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendToToken(token, title, body, data = {}) {
  const message = {
    token,
    notification: { title, body },
    data,
  };
  const response = await admin.messaging().send(message);
  return response;
}

// Example: send to all tokens for staff
async function sendToStaffTokens(tokens, title, body, data) {
  const messages = tokens.map(t => ({ token: t, notification: { title, body }, data }));
  // Admin SDK supports sendAll / sendEachForMulticast
  const { responses } = await admin.messaging().sendAll(messages);
  return responses;
}



export default router;
