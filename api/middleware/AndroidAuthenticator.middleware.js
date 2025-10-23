import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

const authenticator = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const tokenData = jwt.verify(token, SECRET_KEY);

    const deviceId = req.headers['x-device-id'];
    const roomId = req.headers['x-room-id'];
    const hotelId = req.headers['x-hotel-id'];
    const bookingId = req.headers['x-booking-id'];

    req.deviceData = {
      ...tokenData,
      deviceId,
      roomId,
      hotelId,
      bookingId,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authenticator;
