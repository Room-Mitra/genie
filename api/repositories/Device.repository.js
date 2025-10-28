import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#clients/DynamoDb.client.js';

export const registerNewDevice = async (device) => {
  const deviceItem = buildHotelEntityItem(device);

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: deviceItem,
  };

  await DDB.put(params).promise();
  return params.Item;
};
