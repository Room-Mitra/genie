import { DEVICES_TABLE_NAME } from '../../Constants/DB.constants.js';
import DDB from '../../config/DynamoDb.config.js';

// const ID_TYPE = "DEVICE:";
// const addIdType = (device) => {
//     device.deviceId = `${ID_TYPE}${device.deviceId}`;
//     return device;
// }

// const removeIdType = (device) => {
//     device.deviceId = device.deviceId.slice(ID_TYPE.length);
//     return device;
// }

export const registerNewDevice = async (device) => {
  const params = {
    TableName: DEVICES_TABLE_NAME,
    Item: { ...device },
  };

  await DDB.put(params).promise(); // TODO :: Handle Error
  console.info('Device Registered :: ', params);
  return params.Item;
};

export const getAllDevices = async () => {
  const params = {
    TableName: DEVICES_TABLE_NAME,
  };

  const devices = await DDB.scan(params).promise(); // TODO :: Handle Error
  console.log(devices);
  return devices.Items;
};

export const updateDevice = async (device) => {
  const params = {
    TableName: DEVICES_TABLE_NAME,
    Item: { ...device },
  };

  await DDB.put(params).promise(); // TODO :: Handle Error
  return params.Item;
};

export const updateMultipleDevices = async (devices) => {
  const updatedDeviceData = [];
  devices.forEach(async (device) => {
    const updatedData = await updateDevice(device);
    updatedDeviceData.push(updatedData);
  });
  return updatedDeviceData;
};
