import { toIsoString } from '#common/timestamp.helper.js';
import { registerNewDevice } from '#repositories/Device.repository.js';
import { queryLatestHotelByPrefix } from '#repositories/Hotel.repository.js';
import { queryRoomByPrefix } from '#repositories/Room.repository.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY env var is required');
}

// 10 years
const TOKEN_EXPIRES_IN_HOURS = 10 * 365 * 24;
const TOKEN_EXPIRES_IN_SECONDS = TOKEN_EXPIRES_IN_HOURS * 3600;

export const loginDevice = async ({ deviceId, hotelId, roomId }) => {
  const hotel = await queryLatestHotelByPrefix(hotelId);
  if (!hotel) {
    throw new Error(`Hotel not found for ID: ${hotelId}`);
  }

  const room = await queryRoomByPrefix({ hotelId: hotel.hotelId, roomIdPrefix: roomId });
  if (!room) {
    throw new Error(`Room not found for ID: ${roomId}`);
  }

  const device = await registerNewDevice({
    entityType: 'DEVICE',
    deviceId,
    hotelId: hotel.hotelId,
    roomId: room.roomId,
    lastSeen: toIsoString(),
  });

  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    sub: device.deviceId,
    iat: nowSec,
    hotelId: device.hotelId,
    roomId: device.roomId,
    deviceId: device.deviceId,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: `${TOKEN_EXPIRES_IN_HOURS}h` });

  return {
    token,
    expiresInSeconds: TOKEN_EXPIRES_IN_SECONDS,
    device: {
      deviceId: device.deviceId,
      hotelId: device.hotelId,
      roomId: device.roomId,
      createdAt: device.createdAt,
    },
  };
};
