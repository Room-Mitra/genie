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
  addDeviceToCache(deviceDetails);
  addDeviceToDB(deviceDetails);
};

export const getAllDevices = () => {
  console.log(getAllDevicesFromCache());
  return getAllDevicesFromCache();
};

export const updateDevices = async (updatedDevicesData) => {
  updateCache(updatedDevicesData);
  updateDB(updatedDevicesData);
};

export const getRoomInfoFromDeviceId = (deviceId) => {
  const allDevices = getDevices();
  const deviceIndex = allDevices.findIndex((device) => device.deviceId === deviceId);
  if (deviceIndex === -1) {
    throw new Error('Invalid Device');
  }
  return {
    roomId: allDevices[deviceIndex].roomId,
    propertyName: allDevices[deviceIndex].propertyName,
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
