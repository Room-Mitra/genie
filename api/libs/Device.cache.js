import { getAllDevices as fetchAllDevicesFromRepository } from '#repositories/Device.repository.js';
// TODO :: Add TTL
let ALL_DEVICES = [];

export const warmCache = async () => {
  const devices = await fetchAllDevicesFromRepository(); // TODO :: function call should be made to service layer..call to repo layer is bad practise
  ALL_DEVICES = [...devices];
};

export const registerNewDevice = (device) => {
  removeDeviceIfExists(device);
  addDeviceToCache(device);
};

const removeDeviceIfExists = (device) => {
  const deviceId = device.deviceId;
  const deviceIndex = ALL_DEVICES.findIndex((device) => device.deviceId === deviceId);

  if (deviceIndex !== -1) {
    ALL_DEVICES.splice(deviceIndex, 1);
  }
};

const addDeviceToCache = (device) => {
  ALL_DEVICES.push(device);
};

const updateDevice = (device) => {
  removeDeviceIfExists(device);
  addDeviceToCache(device);
};

export const updateMultipleDevices = (devices) => {
  devices.forEach((device) => updateDevice(device));
};

export const getDevices = () => {
  return ALL_DEVICES;
};
