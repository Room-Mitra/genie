import { DEVICES_TABLE_NAME, ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#config/DynamoDb.config.js';

export const registerNewDevice = async (device) => {
  const deviceItem = buildHotelEntityItem(device);

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: deviceItem,
  };

  await DDB.put(params).promise();
  return params.Item;
};

export const getAllDevices = async () => {
  const params = {
    TableName: DEVICES_TABLE_NAME,
  };

  const devices = await DDB.scan(params).promise(); // TODO :: Handle Error
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
