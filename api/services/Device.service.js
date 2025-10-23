import { toIsoString } from '#common/timestamp.helper.js';
import {
  registerNewDevice as addDeviceToCache,
  getDevices as getAllDevicesFromCache,
  updateMultipleDevices as updateCache,
  getDevices,
} from '#libs/Device.cache.js';

import {
  registerNewDevice,
  updateMultipleDevices as updateDB,
} from '#repositories/Device.repository.js';

import { queryLatestHotelByPrefix } from '#repositories/Hotel.repository.js';
import { queryRoomByPrefix } from '#repositories/Room.repository.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY env var is required');
}

// 1 year
const TOKEN_EXPIRES_IN_HOURS = 365 * 24;
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

export const registerDevice = async (deviceDetails) => {
  // const { deviceId } = deviceDetails;
  addDeviceToCache(deviceDetails);
  await registerNewDevice(deviceDetails);
};

export const getAllDevices = (hotelId) => {
  const allDevices = getAllDevicesFromCache() || [];
  if (hotelId) {
    const devicesInProperty = allDevices.filter((device) => device.hotelId === hotelId);
    console.info(`Devices in ${hotelId} property :: `, devicesInProperty);
    return devicesInProperty;
  }
  return allDevices;
};

export const updateDevices = (devices) => {
  updateCache(devices);
  updateDB(devices);
};

export const getRoomInfoFromDeviceId = (deviceId) => {
  const allDevices = getDevices();
  const deviceIndex = allDevices.findIndex((device) => device.deviceId === deviceId);
  if (deviceIndex === -1) {
    throw new Error('Invalid Device: ' + deviceId);
  }
  return {
    roomId: allDevices[deviceIndex].roomId,
    propertyName: allDevices[deviceIndex].propertyName,
    hotelId: allDevices[deviceIndex].hotelId,
    floor: allDevices[deviceIndex].floor,
    roomTags: allDevices[deviceIndex].roomTags,
    roomNotes: allDevices[deviceIndex].roomNotes,
  };
};

export const addBookingToRoom = async (roomId, bookingId) => {
  const [deviceInfo] = getAllDevices().filter((device) => device.roomId === roomId);
  deviceInfo['currentBooking'] = bookingId;
  updateDevices([deviceInfo]);
};
