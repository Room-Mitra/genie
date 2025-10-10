import {
  registerNewDevice as addDeviceToCache,
  getDevices as getAllDevicesFromCache,
  updateMultipleDevices as updateCache,
  getDevices,
} from './Device.cache.js';

import {
  registerNewDevice as addDeviceToDB,
  updateMultipleDevices as updateDB,
} from './Device.repository.js';

export const registerDevice = async (deviceDetails) => {
  // const { deviceId } = deviceDetails;
  addDeviceToCache(deviceDetails);
  await addDeviceToDB(deviceDetails);
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
  console.log(deviceInfo, '++++++++++++++DEVICE INFO++++++++++++');
  updateDevices([deviceInfo]);
};
