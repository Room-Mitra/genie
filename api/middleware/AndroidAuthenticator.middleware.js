import { queryLatestBookingById } from '#repositories/Booking.repository.js';
import { queryRoomByPrefix } from '#repositories/Room.repository.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

const authenticator = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const deviceData = jwt.verify(token, SECRET_KEY);

    const { hotelId, roomId, deviceId } = deviceData;
    if (!hotelId || !roomId || !deviceId)
      return res
        .status(401)
        .json({ message: 'Invalid token. Require hotelId, roomId and deviceId in token' });

    const bookingId = req.headers['x-booking-id'];

    const room = await queryRoomByPrefix({ hotelId, roomIdPrefix: roomId });
    if (!room) return res.status(401).json({ message: 'invalid roomId, not found' });

    if (bookingId) {
      const booking = await queryLatestBookingById({ hotelId, bookingId });
      if (!booking) return res.status(401).json({ message: 'invalid bookingId, not found' });
    }

    req.deviceData = {
      ...deviceData,
      bookingId,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authenticator;
